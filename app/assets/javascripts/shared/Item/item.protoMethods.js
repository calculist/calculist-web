calculist.register('item.protoMethods', [], function () {

  // TODO Add all proto methods here
  return [
    // view related
      // mutates state
        'applySyntaxHighlighting',
        'collapse',
        'collapseRecursive',
        'customKeyboardShortcuts',
        'down',
        'enterCommandMode',
        'exitCommandMode',
        'focus',
        'handleBlur',
        'handleDotClick',
        'handleEnter',
        'handleKeydown',
        'handleKeypress',
        'handleKeyup',
        'up',
      // non-mutating functions
        'getLineCount',
        'getLineWidthInCharacters',
        'isWithinZoom',
        'template',

    // data related
      // mutates state
        'addChild',
        'addNewChildAfter',
        'addNewChildBefore',
        'addText',
        'applyDelta',
        'changeText',
        'executeCommand',
        'pivotItems',
        'refreshSortOrder',
        'splitToList',
      // non-mutating functions
        '$item',
        '_flatten',
        'flatten',
        'flatten_v2',
        'toHTML',
        'toMarkdown',
  ];

});
