calculist.register('itemsToSVG', ['_'], function (_) {
  var attributes = [
    // A
    'accent-height','accumulate','additive','alignment-baseline','allowReorder','alphabetic','amplitude','arabic-form','ascent','attributeName','attributeType','autoReverse','azimuth',
    // B
    'baseFrequency','baseline-shift','baseProfile','bbox','begin','bias','by',
    // C
    'calcMode','cap-height','class','clip','clipPathUnits','clip-path','clip-rule','color','color-interpolation','color-interpolation-filters','color-profile','color-rendering','contentScriptType','contentStyleType','cursor','cx','cy',
    // D
    'd','decelerate','descent','diffuseConstant','direction','display','divisor','dominant-baseline','dur','dx','dy',
    // E
    'edgeMode','elevation','enable-background','end','exponent','externalResourcesRequired',
    // F
    'fill','fill-opacity','fill-rule','filter','filterRes','filterUnits','flood-color','flood-opacity','font-family','font-size','font-size-adjust','font-stretch','font-style','font-variant','font-weight','format','from','fr','fx','fy',
    // G
    'g1','g2','glyph-name','glyph-orientation-horizontal','glyph-orientation-vertical','glyphRef','gradientTransform','gradientUnits',
    // H
    'hanging','height','href','horiz-adv-x','horiz-origin-x',
    // I
    'id','ideographic','image-rendering','in','in2','intercept',
    // K
    'k','k1','k2','k3','k4','kernelMatrix','kernelUnitLength','kerning','keyPoints','keySplines','keyTimes',
    // L
    'lang','lengthAdjust','letter-spacing','lighting-color','limitingConeAngle','local',
    // M
    'marker-end','marker-mid','marker-start','markerHeight','markerUnits','markerWidth','mask','maskContentUnits','maskUnits','mathematical','max','media','method','min','mode',
    // N
    'name','numOctaves',
    // O
    'offset',
    // 'onabort','onactivate','onbegin','onclick','onend','onerror','onfocusin','onfocusout','onload','onmousedown','onmousemove','onmouseout','onmouseover','onmouseup','onrepeat','onresize','onscroll','onunload',
    'opacity','operator','order','orient','orientation','origin','overflow','overline-position','overline-thickness',
    // P
    'panose-1','paint-order','pathLength','patternContentUnits','patternTransform','patternUnits','pointer-events','points','pointsAtX','pointsAtY','pointsAtZ','preserveAlpha','preserveAspectRatio','primitiveUnits',
    // R
    'r','radius','refX','refY','rendering-intent','repeatCount','repeatDur','requiredExtensions','requiredFeatures','restart','result','rotate','rx','ry',
    // S
    'scale','seed','shape-rendering','slope','spacing','specularConstant','specularExponent','speed','spreadMethod','startOffset','stdDeviation','stemh','stemv','stitchTiles','stop-color','stop-opacity','strikethrough-position','strikethrough-thickness','string','stroke','stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-opacity','stroke-width','style','surfaceScale','systemLanguage',
    // T
    'tabindex','tableValues','target','targetX','targetY','text-anchor','text-decoration','text-rendering','textLength','to','transform','type',
    // U
    'u1','u2','underline-position','underline-thickness','unicode','unicode-bidi','unicode-range','units-per-em',
    // V
    'v-alphabetic','v-hanging','v-ideographic','v-mathematical','values','version','vert-adv-y','vert-origin-x','vert-origin-y','viewBox','viewTarget','visibility',
    // W
    'width','widths','word-spacing','writing-mode',
    // X
    'x','x-height','x1','x2','xChannelSelector','xlink:actuate','xlink:arcrole','xlink:href','xlink:role','xlink:show','xlink:title','xlink:type','xml:base','xml:lang','xml:space',
    // Y
    'y','y1','y2','yChannelSelector',
    // Z
    'z','zoomAndPan',
  ];
  var tags = [
    // A
    'a','altGlyph','altGlyphDef','altGlyphItem','animate','animateColor','animateMotion','animateTransform','audio',
    // B C
    'canvas','circle','clipPath','color-profile','cursor',
    // D
    'defs','desc','discard',
    // E
    'ellipse',
    // F
    'feBlend','feColorMatrix','feComponentTransfer','feComposite','feConvolveMatrix','feDiffuseLighting','feDisplacementMap','feDistantLight','feDropShadow','feFlood','feFuncA','feFuncB','feFuncG','feFuncR','feGaussianBlur','feImage','feMerge','feMergeNode','feMorphology','feOffset','fePointLight','feSpecularLighting','feSpotLight','feTile','feTurbulence','filter','font','font-face','font-face-format','font-face-name','font-face-src','font-face-uri','foreignObject',
    // G
    'g','glyph','glyphRef',
    // H
    'hatch','hatchpath','hkern',
    // I
    //'iframe',
    'image',
    // J K L
    'line','linearGradient',
    // M
    'marker','mask','mesh','meshgradient','meshpatch','meshrow','metadata','missing-glyph','mpath',
    // N O P
    'path','pattern','polygon','polyline',
    // Q R
    'radialGradient','rect',
    // S
    'script','set','solidcolor','stop','style','svg','switch','symbol',
    // T
    'text','textPath','title','tref','tspan',
    // U
    'unknown','use',
    // V — Z
    'video','view','vkern',
  ];
  attributes = attributes.reduce(function (attrs, attr) {
    attrs[attr] = true;
    return attrs;
  }, {});
  tags = tags.reduce(function (_tags, tag) {
    _tags[tag] = true;
    return _tags;
  }, {});

  var isXAttr = function (attr) {
    return attr === 'x' || attr === 'x1' || attr === 'x2' || attr === 'cx';
  };

  var isYAttr = function (attr) {
    return attr === 'y' || attr === 'y1' || attr === 'y2' || attr === 'cy';
  };

  return function (items, options) {
    var svg = '';
    options || (options = {});
    var topTag = options.topTag || 'svg';
    var scaleX = options.scaleX || _.identity;
    var scaleY = options.scaleY || _.identity;
    var scaleHeight = options.scaleHeight || scaleY;
    var addItems, addElement;
    var currentTag;
    var currentRect;
    addItems = function (items, datum, i) {
      _.each(items, function (_item) {
        var val = _item.valueOf();
        if (tags[_item.key]) {
          svg += '>';
          addElement(_item, datum, i);
        } else if (attributes[_item.key]) {
          if (_.isFunction(val)) val = val(datum, i);
          if (isXAttr(_item.key)) val = scaleX(val);
          if (_item.key === 'width') val = scaleX(val) - scaleX(0);
          if (isYAttr(_item.key) || _item.key === 'height') {
            if (currentTag === 'rect') {
              currentRect || (currentRect = {});
              currentRect[_item.key] = val;
              if (currentRect['y'] != null && currentRect['height'] != null) {
                var height = scaleHeight(currentRect['height']);
                var y = scaleY(currentRect['y']) - height;
                svg += 'y="' + _.escape(y) + '" height="' + _.escape(height) + '" ';
                currentRect = null;
              }
              return;
            } else {
              val = scaleY(val);
            }
          }
          svg += _item.key + '="' + _.escape(val) + '" ';
        } else if (_item.key === 'for each') {
          if (val.items) val = val.items;
          _.each(val, function (_datum, _i) {
            addItems(_item.items, _datum, _i);
          });
        }
      });
    };
    addElement = function (item, datum, i) {
      svg += '<' + item.key + ' ';
      currentTag = item.key;
      currentRect = null;
      addItems(item.items, datum, i);
      if (svg[svg.length - 1] !== '>') svg += '>';
      svg += '</' + item.key + '>';
    };
    addElement({key: topTag, items: items });
    return svg;
  };
});
