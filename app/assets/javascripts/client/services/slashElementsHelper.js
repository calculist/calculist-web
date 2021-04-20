calculist.register('slashElementsHelper', ['parseUntilBalanced', 'emojiHelper', 'itemTagsHelper', 'urlFinder'], function (parseUntilBalanced, emojiHelper, itemTagsHelper, urlFinder) {
  var findItem = function (item, pattern) {
    // if (pattern.test(item.text)) return item;
    if (item.items.length === 0) return null;
    // must search by text, not key
    var csfi;
    var i = 0;
    while (csfi == null && i < item.items.length) {
      // csfi = findItem(item.items[i], pattern);
      if (pattern.test(item.items[i].text)) csfi = item.items[i];
      i += 1;
    }
    return csfi;
  };
  var arbitraryNumber = 100;
  var parseCustomTerms = function (string, depth) {
    if (depth > arbitraryNumber) return string;
    if (!string) return string;
    if (!string.replace) {
      if (string.toHTML) return string.toHTML();
      return string;
    }
    return string.replace(/\\\.([a-zA-Z_0-9]+)\[.*\]/g, function (text, f) {
      // TODO refactor
      var csfi = itemTagsHelper.getItemByIdTag('lexicon');;
      var termPath = f.split('.');
      var nextTerm;
      var nextItem = csfi;
      while (termPath.length && nextItem) {
        nextTerm = termPath.shift();
        nextItem = findItem(nextItem, new RegExp('^' + nextTerm));
      }
      var cf = nextItem;
      if (cf && _.isFunction(cf.val)) {
        var bracketText = parseUntilBalanced(text.slice(2 + f.length));
        var remainingText = text.slice(2 + f.length + bracketText.length);
        if (remainingText) remainingText = parseSlashBrackets(remainingText);
        var innerText = parseCustomTerms(cf.val(bracketText.slice(1, bracketText.length - 1)), (depth || 0) + 1);
        return innerText + remainingText;
      }
      return text;
    })
    .replace(/\\\.([a-zA-Z_0-9\.]+)(?:\s|$)/g, function (text, f) {
      var csfi = itemTagsHelper.getItemByIdTag('lexicon');
      var termPath = f.split('.');
      var nextTerm;
      var nextItem = csfi;
      while (termPath.length && nextItem) {
        nextTerm = termPath.shift();
        nextItem = findItem(nextItem, new RegExp('^' + nextTerm));
      }
      var cf = nextItem;
      if (cf && cf.hasVal) {
        return parseCustomTerms(cf.val, (depth || 0) + 1) + ' ';
      }
      return text;
    });
  };
  var parseSlashBrackets = function (string) {
    // TODO \LaTeX, \link
    return parseCustomTerms(string).replace(/\\(header|small|bold|italic|strike|underline|code|comment|highlight|(?:highlight\-(?:red|pink|blue|green|yellow|orange))|metadata|id|system\-id|ref|command|image|lookup)\[.*\]/g, function (text, f) {
      if (f === 'metadata') return '';
      // TODO handle different highlight colors
      var bracketText = parseUntilBalanced(text.slice(1 + f.length));
      var remainingText = text.slice(1 + f.length + bracketText.length);
      if (remainingText) remainingText = parseSlashBrackets(remainingText);
      var innerText = parseSlashBrackets(bracketText.slice(1, bracketText.length - 1));
      var prefix = '';
      if (f === 'id' || f === 'ref' || f === 'system-id') {
        prefix = '<span class="tag-prefix">' + f + ':</span>';
        // if (f === 'id') {
        //   // NOTE this isn't working yet
        //   var dup = itemTagsHelper.getItemByIdTag(innerText);
        //   if (dup) { f = 'tag dup'; } else { f = 'tag'; }
        // } else {
          f = 'tag';
        // }
      // } else if (f === 'label') {
      //   f = 'tag';
      } else if (f === 'image') {
        // BUG There's a "sometimes" bug here with data URIs sometimes not passing the regexp.
        // Same data uri, but sometimes it passes and sometimes it doesn't.
        if (urlFinder.isUrl(innerText) || urlFinder.isDataURI(innerText.trim())) {
          return '<img src="' + innerText + '"/>' + remainingText;
        } else {
          var parts = innerText.split(',');
          var n = parseInt(parts[0]);
          if (parts[1] && (urlFinder.isUrl(parts[1]) || urlFinder.isDataURI(parts[1].trim()))) {
            return '<img src="' + parts[1] + '" width="' + n  + '"/>'
          } else {
            return text;//innerText + remainingText;
          }
        }
      } else if (f === 'link') {
        // TODO
      } else if (f === 'lookup') {
        var path = innerText.split(/\s*\/\s*/);
        var item = itemTagsHelper.getItemByIdTag(path.shift());
        while (item && path.length) {
          item = findItem(item, new RegExp('^' + _.escapeRegExp(path.shift())));
        }
        if (item) {
          if (item.hasVal) return _.escape(item.valueOf()) + remainingText;
          return item.getComputedHTML();
        } else {
          return text;
        }
      }
      return '<span class="'+f+'">' + prefix + innerText + '</span>' + remainingText;
    })
    .replace(/\\emoji\[([\\a-zA-Z0-9]+)\]/g, function (text, emojiUTF16) {
      return emojiHelper.unescapeToUnicode(emojiUTF16);
    })
    .replace(/\\emoji\[(U\+[\\a-fA-F0-9]+)\]/g, function (text, codePointString) {
      return emojiHelper.fromCodePointString(codePointString);
    })
    ;
  };
  // TODO Parse to plain text
  var parseSlashElements = function (string) {
    return parseSlashBrackets(string)
      .replace(/^\\(header|small|bold|italic|strike|underline|code|comment|highlight|break)\s.*$/, function (text, f) {
        if (f === 'break') return '<hr/>';

        return '<span class="'+f+'">' +
          text.slice(1 + f.length + 1) +
        '</span>';
      })
    ;
  };
  var parseSlashCommands = function (string) {
    var parse = function (string, commands) {
      var i = string.indexOf("\\command[");
      if (i === -1) return commands;
      var commandString = parseUntilBalanced(string.slice(i));
      if (commandString) commands.push(commandString.slice(1, commandString.length - 1));
      var consumedTextLength = i + '\\command'.length + commandString.length;
      if (consumedTextLength < string.length) return parse(string.slice(consumedTextLength), commands);
      return commands;
    };
    return parse(string, []);
  };
  return {
    parseCustomTerms: parseCustomTerms,
    parseSlashElements: parseSlashElements,
    parseSlashCommands: parseSlashCommands,
  };
});
