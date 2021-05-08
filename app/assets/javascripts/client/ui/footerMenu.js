calculist.register('footerMenu', ['_','eventHub', 'zoomPage', 'undoManager'], function (_, eventHub, zoomPage, undoManager) {
  var commands = [
    'zoom in', 'zoom out',
    'expand', 'collapse',
    'indent', 'outdent',
    'move up', 'move down',
    'undo','redo',
    'copy', 'copy items',
    'delete', 'delete items',//'duplicate',
    'search', 'command mode',
  ];
  var commandIcons = {
    'undo': 'gg-undo',
    'redo': 'gg-redo',
    'zoom in': 'gg-zoom-in',
    'zoom out': 'gg-zoom-out',
    'indent': 'gg-push-chevron-right',
    'outdent': 'gg-push-chevron-left',
    'move up': 'gg-push-chevron-up',
    'move down': 'gg-push-chevron-down',
    'expand': 'gg-arrows-v',
    'collapse': 'gg-arrows-merge-alt-v',
    'search': 'gg-search',
    'delete': 'gg-trash-empty',
    'delete items': 'gg-trash',
    'command mode': 'gg-terminal',
    'copy': 'gg-copy',
    'copy items': 'gg-copy',
    'duplicate': 'gg-duplicate',
    'outdent straight': 'gg-move-left',
    'indent siblings': 'gg-move-task',
    pin: 'gg-pin-alt',
  };
  var commandIconMargins = {
    'indent': '-1px auto 0 -4px',
    'outdent': '-1px auto 0 1px',
    'move down': '-3px auto 0 auto',
    'delete': '5px auto 0 auto',
    'delete items': '5px auto 0 auto',
    'duplicate': '7px auto 0 2px',
    'undo': '3px auto',
    'redo': '3px auto',
    'command mode': '0 -2px',
  }
  var iof = null;
  var footerEl = $('#footer');
  var commandEls = commands.map(function (command, i) {
    var secondOfPair = i % 2 || command === 'expand' || command === 'move up';
    return '<span class="command-icon" title="' + command + '"' +
      (secondOfPair ? 'style="margin-left: -1px;"' : '') + '>' +
      (
        commandIcons[command] ?
          (
            '<i style="margin:' +
            (commandIconMargins[command] ? commandIconMargins[command] : '0 auto') +
            ';" class="' + commandIcons[command] + '" title="' + command + '" ></i>' +
            (
              command === 'copy' ?
                ( // NOTE This is a hack to add the black dot on the copy icon
                  '<span style="pointer-events: none; display: block; width: 6px; height: 10px; background: #fff; position: relative;top: -14px;left: 7px;"></span>' +
                  '<span style="pointer-events: none; display: block; width: 6px; height: 6px; background: #000; position: relative;top: -22px;left: 7px;border-radius: 8px;"></span>'
                ) :
                // NOTE This is a hack to add the black dot on the delete icon
                (command === 'delete' ? '<span style="pointer-events: none; display: block; width: 6px; height: 6px; background: #000; position: relative;top: -9px;left: 7px;border-radius: 8px;"></span>' : '')
            )
          ) :
          command
      ) +
    '</span>';
  });
  var refreshState = _.debounce(function () {
    var disable = function (command, disabled) {
      $('.command-icon [title="' + command + '"]').css(
        'opacity', disabled ? '0.3' : '1'
      );
    }
    if (iof) {
      var topItem = zoomPage.getTopItem();
      disable('zoom in', zoomPage.getTopItem() === iof);
      disable('zoom out', zoomPage.getZoomDepth() === 0);
      disable('expand', !iof.collapsed);
      disable('collapse', iof === topItem || iof.collapsed || iof.items.length === 0);
      disable('indent', iof === topItem || iof === iof.parent.items[0]);
      disable('outdent', iof === topItem || iof.parent === topItem);
      disable('move up', iof === topItem || iof === topItem.items[0]);
      disable('move down', iof === topItem || iof === topItem.items[topItem.items.length - 1]);

      disable('undo', !undoManager.hasUndo());
      disable('redo', !undoManager.hasRedo());
      disable('delete', iof === topItem);
      disable('delete items', iof.items.length === 0);
      disable('copy items', iof.items.length === 0);
      // disable('duplicate', iof === topItem);
    }
  }, 50);
  eventHub.on('transactionend', refreshState);
  eventHub.on('undoableTransaction', refreshState);
  eventHub.on('undo', refreshState);
  eventHub.on('redo', refreshState);
  eventHub.on('delayedCollapse', refreshState);
  footerEl.html('<div class="command-icons-container">' +
    commandEls.join('') +
  '</div>').on('click', function (e) {
    e.preventDefault();
    if (iof) {
      iof.executeCommand(e.target.title);
    }
  });
  footerEl.css({
    display: iof ? 'block' : 'none'
  });
  eventHub.on('itemOfFocusChange', function (newIOF) {
    var prevIOF = iof;
    iof = newIOF;
    refreshState();
    if (iof && !prevIOF) {
      footerEl.show();
    } else if (!iof) {
      footerEl.hide();
    }
  });
  return {

  }
})
