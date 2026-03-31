#!/usr/bin/env node

/**
 * Converts calculist's acyclic module system files to ES module TypeScript files.
 *
 * Strategy: Keep each module's callback function intact and just replace
 * the calculist.register/require wrapper with ES imports + a function call.
 *
 * calculist.register('name', ['dep1', 'dep2'], function(dep1, dep2) { ... return value; })
 *   becomes:
 * import dep1 from '...';
 * import dep2 from '...';
 * const _module = (function(dep1, dep2) { ... return value; })(dep1, dep2);
 * export default _module;
 *
 * calculist.require(['Item', 'dep1'], function(Item, dep1) { ... })
 *   becomes:
 * import Item from '...';
 * import dep1 from '...';
 * (function(Item, dep1) { ... })(Item, dep1);
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'app/assets/javascripts');
const DEST = path.join(ROOT, 'app/javascript');

// ===== Scan and index all module files =====

const moduleFiles = {};
const allFiles = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.js')) {
      allFiles.push(fullPath);
    }
  }
}

scanDir(path.join(SRC, 'shared'));
scanDir(path.join(SRC, 'client'));

for (const file of allFiles) {
  const code = fs.readFileSync(file, 'utf8');
  // Find all register calls — a file can have multiple
  const re = /calculist\.register\(\s*'([^']+)'/g;
  let match;
  while ((match = re.exec(code)) !== null) {
    const name = match[1];
    if (!moduleFiles[name]) {
      moduleFiles[name] = file;
    }
  }
}

// ===== Vendor imports =====

const VENDOR_IMPORTS = {
  '_': { import: "import _ from 'lodash';", varName: '_' },
  '$': { import: "import $ from 'jquery';", varName: '$' },
  'Backbone': { import: "import Backbone from 'backbone';", varName: 'Backbone' },
  'Papa': { import: "import Papa from 'papaparse';", varName: 'Papa' },
  'jsondiffpatch': { import: "import jsondiffpatch from 'jsondiffpatch';", varName: 'jsondiffpatch' },
  'Clipboard': { import: "import Clipboard from 'clipboard';", varName: 'Clipboard' },
  'ss': { import: "import * as ss from 'simple-statistics';", varName: 'ss' },
  'd3': { import: "import * as d3 from 'd3';", varName: 'd3' },
  'katex': { import: "import katex from 'katex';", varName: 'katex' },
  'evalculist': { import: "import evalculist from '../vendor/evalculist';", varName: 'evalculist' },
  'confetti': { import: "import confetti from '../vendor/confetti';", varName: 'confetti' },
  'UndoManager': { import: "import UndoManager from '../vendor/undomanager';", varName: 'UndoManager' },
  'Promise': null, // native global
  'Worker': null,  // native global
};

function getDestPath(srcPath) {
  const rel = path.relative(SRC, srcPath);
  return path.join(DEST, rel.replace(/\.js$/, '.ts'));
}

function relImportPath(fromDest, toDest) {
  let rel = path.relative(path.dirname(fromDest), path.dirname(toDest));
  if (!rel) rel = '.';
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel + '/' + path.basename(toDest, '.ts');
}

function safeVarName(name) {
  return name.replace(/[.\-]/g, '_');
}

function getImport(depName, fromSrcPath) {
  // Check vendor
  if (VENDOR_IMPORTS.hasOwnProperty(depName)) {
    const v = VENDOR_IMPORTS[depName];
    if (!v) return null; // native global, no import needed
    return v;
  }

  // Check module registry
  const depFile = moduleFiles[depName];
  if (!depFile) {
    return { import: `// TODO: resolve import for '${depName}'`, varName: safeVarName(depName) };
  }

  const fromDest = getDestPath(fromSrcPath);
  const toDest = getDestPath(depFile);
  const importPath = relImportPath(fromDest, toDest);
  const varName = safeVarName(depName);
  return { import: `import ${varName} from '${importPath}';`, varName };
}

// ===== Conversion =====

function convertFile(srcPath) {
  const code = fs.readFileSync(srcPath, 'utf8');
  const basename = path.basename(srcPath);
  const destPath = getDestPath(srcPath);

  // Skip special files
  if (['vendors.js', 'calculist.js', 'extendItemPrototype.js'].includes(basename)) {
    return { skipped: true, reason: 'special file' };
  }

  // Check if it uses acyclic
  if (!code.includes('calculist.register(') && !code.includes('calculist.require(')) {
    return { skipped: true, reason: 'no acyclic calls' };
  }

  // Split file into segments: each calculist.register(...) or calculist.require(...)
  // For most files there's one call that wraps the entire file.
  // For files with multiple calls (e.g., item.flatten.js has 3 registers),
  // we process each one.

  // Strategy: replace each calculist.register/require call in the source text.
  // The callback function is preserved verbatim.

  const allImports = new Map(); // depName -> { import, varName }
  let output = code;

  // Process all register calls
  // Pattern: calculist.register('name', [deps], callbackOrValue)
  output = output.replace(
    /calculist\.register\(\s*'([^']+)'\s*,\s*\[([^\]]*)\]\s*,\s*/g,
    function(match, name, depsStr) {
      const deps = depsStr ? depsStr.split(',').map(d => d.trim().replace(/'/g, '')).filter(Boolean) : [];

      // Collect imports
      deps.forEach(dep => {
        if (!allImports.has(dep)) {
          const imp = getImport(dep, srcPath);
          if (imp) allImports.set(dep, imp);
        }
      });

      // Replace with: const _name = (
      // The callback function follows, and we'll close it below
      return `const ${safeVarName(name)} = (`;
    }
  );

  // Process all require calls
  // Pattern: calculist.require([deps], callbackOrValue)
  output = output.replace(
    /calculist\.require\(\s*\[([^\]]*)\]\s*,\s*/g,
    function(match, depsStr) {
      const deps = depsStr ? depsStr.split(',').map(d => d.trim().replace(/'/g, '')).filter(Boolean) : [];

      deps.forEach(dep => {
        if (!allImports.has(dep)) {
          const imp = getImport(dep, srcPath);
          if (imp) allImports.set(dep, imp);
        }
      });

      // Replace with: (
      return '(';
    }
  );

  // The original code ends each register/require with );
  // After our replacement:
  //   const name = (function(a, b) { ... }); -> need to call it
  //   or (function(a, b) { ... }); -> need to call it
  //
  // We need to change the closing ); to )(args);
  // This is tricky because we can't easily match the closing paren.
  //
  // Simpler approach: for register, find the callback's param list and
  // invoke it. We can do this by finding `function(params) {` patterns
  // and using the param names as call arguments.

  // Actually, let me take an even simpler approach: extract deps from each
  // register/require call, and after the function body ends with `);`,
  // insert the invocation arguments.

  // Let me restart with a cleaner approach for the whole file.
  // Read the original code and do precise transformations.

  return convertFilePrecise(srcPath, code, destPath);
}

function convertFilePrecise(srcPath, code, destPath) {
  const allImports = new Map();
  const segments = [];

  // Find all calculist.register and calculist.require calls
  const callRegex = /calculist\.(register|require)\(/g;
  let callMatch;
  const calls = [];
  while ((callMatch = callRegex.exec(code)) !== null) {
    calls.push({ type: callMatch[1], index: callMatch.index, fullMatchEnd: callRegex.lastIndex });
  }

  if (calls.length === 0) {
    return { skipped: true, reason: 'no acyclic calls' };
  }

  let lastEnd = 0;

  for (const call of calls) {
    // Add any text before this call
    if (call.index > lastEnd) {
      const before = code.slice(lastEnd, call.index).trim();
      if (before) segments.push(before);
    }

    // Parse from the opening paren
    const rest = code.slice(call.fullMatchEnd);

    let name = null;
    let deps = [];
    let callbackStart; // position in `rest` where the callback function starts
    let paramNames = [];

    if (call.type === 'register') {
      // 'name', [deps], callback)
      const nameMatch = rest.match(/^\s*'([^']+)'\s*,\s*\[([^\]]*)\]\s*,\s*/);
      if (!nameMatch) {
        segments.push(code.slice(call.index)); // give up, copy as-is
        lastEnd = code.length;
        continue;
      }
      name = nameMatch[1];
      deps = nameMatch[2] ? nameMatch[2].split(',').map(d => d.trim().replace(/'/g, '')).filter(Boolean) : [];
      callbackStart = nameMatch[0].length;
    } else {
      // [deps], callback)
      const depsMatch = rest.match(/^\s*\[([^\]]*)\]\s*,\s*/);
      if (!depsMatch) {
        segments.push(code.slice(call.index));
        lastEnd = code.length;
        continue;
      }
      deps = depsMatch[1] ? depsMatch[1].split(',').map(d => d.trim().replace(/'/g, '')).filter(Boolean) : [];
      callbackStart = depsMatch[0].length;
    }

    // Collect imports
    deps.forEach(dep => {
      if (!allImports.has(dep)) {
        const imp = getImport(dep, srcPath);
        if (imp) allImports.set(dep, imp);
      }
    });

    // The callback is everything from callbackStart to the matching closing paren
    const callbackCode = rest.slice(callbackStart);

    // Check if callback is a short form like _.extend or _.constant(fn)
    const shortMatch = callbackCode.match(/^([^{(]+?)\s*\)\s*;?\s*/);
    if (shortMatch && !callbackCode.startsWith('function')) {
      const shortFn = shortMatch[1].trim();
      const depVars = deps.map(d => allImports.get(d)?.varName || safeVarName(d));

      if (name) {
        segments.push(`const ${safeVarName(name)} = (${shortFn})(${depVars.join(', ')});`);
      } else {
        segments.push(`(${shortFn})(${depVars.join(', ')});`);
      }
      lastEnd = call.fullMatchEnd + callbackStart + shortMatch[0].length;
      continue;
    }

    // Find the function's parameter list
    const funcMatch = callbackCode.match(/^function\s*\(([^)]*)\)/);
    if (funcMatch) {
      paramNames = funcMatch[1].split(',').map(p => p.trim()).filter(Boolean);
    }

    // Find the matching closing paren of the register/require call
    // The callback is: function(...) { ... }
    // followed by ); to close the register/require call
    let braceDepth = 0;
    let inFunction = false;
    let funcEnd = -1;
    for (let i = 0; i < callbackCode.length; i++) {
      if (callbackCode[i] === '{') {
        braceDepth++;
        inFunction = true;
      } else if (callbackCode[i] === '}') {
        braceDepth--;
        if (braceDepth === 0 && inFunction) {
          funcEnd = i + 1;
          break;
        }
      }
    }

    if (funcEnd === -1) {
      segments.push(code.slice(call.index));
      lastEnd = code.length;
      continue;
    }

    const funcBody = callbackCode.slice(0, funcEnd);
    const depVars = deps.map(d => {
      if (VENDOR_IMPORTS.hasOwnProperty(d) && !VENDOR_IMPORTS[d]) {
        return d; // native globals like Promise, Worker
      }
      return allImports.get(d)?.varName || safeVarName(d);
    });

    if (name) {
      segments.push(`const ${safeVarName(name)} = (${funcBody})(${depVars.join(', ')});`);
    } else {
      segments.push(`(${funcBody})(${depVars.join(', ')});`);
    }

    // Skip past the closing ); of the register/require call
    const afterFunc = callbackCode.slice(funcEnd);
    const closeMatch = afterFunc.match(/^\s*\)\s*;?\s*/);
    const closeLen = closeMatch ? closeMatch[0].length : 0;

    lastEnd = call.fullMatchEnd + callbackStart + funcEnd + closeLen;
  }

  // Add any trailing code
  if (lastEnd < code.length) {
    const trailing = code.slice(lastEnd).trim();
    if (trailing) segments.push(trailing);
  }

  // Build imports section
  const importLines = [];
  for (const [dep, info] of allImports) {
    importLines.push(info.import);
  }

  // Find default exports — registered modules
  const registeredNames = calls
    .filter(c => c.type === 'register')
    .map(c => {
      const rest = code.slice(c.fullMatchEnd);
      const m = rest.match(/^\s*'([^']+)'/);
      return m ? m[1] : null;
    })
    .filter(Boolean);

  let body = segments.join('\n\n');

  // Build final output
  let output = '';
  if (importLines.length) {
    output += importLines.join('\n') + '\n\n';
  }
  output += body + '\n';

  // Add default export for the first (or only) registered module
  if (registeredNames.length === 1) {
    output += `\nexport default ${safeVarName(registeredNames[0])};\n`;
  } else if (registeredNames.length > 1) {
    // Multiple exports
    output += '\nexport { ' + registeredNames.map(safeVarName).join(', ') + ' };\n';
  }

  return { skipped: false, destPath, output };
}

// ===== Main =====

console.log('Scanning source files...');
console.log(`Found ${allFiles.length} JS files with ${Object.keys(moduleFiles).length} named modules\n`);

const results = { converted: 0, skipped: 0, errors: 0 };

for (const srcPath of allFiles) {
  const rel = path.relative(SRC, srcPath);
  const basename = path.basename(srcPath);

  if (['vendors.js', 'calculist.js', 'extendItemPrototype.js'].includes(basename)) {
    console.log(`SKIP  ${rel} (special file)`);
    results.skipped++;
    continue;
  }

  try {
    const result = convertFile(srcPath);

    if (result.skipped) {
      console.log(`SKIP  ${rel} (${result.reason})`);
      results.skipped++;
      continue;
    }

    const destDir = path.dirname(result.destPath);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(result.destPath, result.output);
    console.log(`OK    ${rel} -> ${path.relative(DEST, result.destPath)}`);
    results.converted++;
  } catch (err) {
    console.error(`ERROR ${rel}: ${err.message}`);
    results.errors++;
  }
}

console.log(`\nDone: ${results.converted} converted, ${results.skipped} skipped, ${results.errors} errors`);
