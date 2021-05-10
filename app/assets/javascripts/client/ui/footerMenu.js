calculist.register('footerMenu', ['_','eventHub', 'zoomPage', 'undoManager','userAgentHelper'], function (_, eventHub, zoomPage, undoManager, userAgentHelper) {
  var commands = [
    'zoom in', 'zoom out',
    'expand', 'collapse',
    'indent', 'outdent',
    'move up', 'move down',
    'undo','redo',
    'copy', 'copy items',
    'delete', 'delete items',
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
    // 'duplicate': 'gg-duplicate',
    'outdent straight': 'gg-move-left',
    'indent siblings': 'gg-move-task',
    pin: 'gg-pin-alt',
    unpin: 'gg-pin-bottom',
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
    pin: '9px auto 0 auto',
    unpin: '11px auto 0 auto',
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
                  '<span title="copy" style="pointer-events: none; display: block; width: 6px; height: 10px; background: #fff; position: relative;top: -14px;left: 7px;"></span>' +
                  '<span title="copy" style="pointer-events: none; display: block; width: 6px; height: 6px; background: #000; position: relative;top: -22px;left: 7px;border-radius: 8px;"></span>'
                ) :
                // NOTE This is a hack to add the black dot on the delete icon
                (command === 'delete' ? '<span  title="delete" style="pointer-events: none; display: block; width: 6px; height: 6px; background: #000; position: relative;top: -9px;left: 7px;border-radius: 8px;"></span>' : '')
            )
          ) :
          command
      ) +
    '</span>';
  });
  if (!userAgentHelper.isMobileDevice) {
    (function () {
      var pinned = sessionStorage.commandMenuPin === '1';
      var icon = commandIcons[pinned ? 'unpin' : 'pin'];
      var title = (pinned ? 'un' : '') + 'pin command menu';
      var margin = commandIconMargins[pinned ? 'unpin' : 'pin'];
      commandEls.push('<span class="command-icon pin" title="' + title + '">' +
        '<i class="' + icon + '" title="' + title + '" style="margin: ' + margin + '"></i>' +
      '</span>');
      if (pinned) {
        footerEl.css({bottom: 0, opacity: 1});
      }
    })();
  }
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
      var topOrFirst = function (top) { return top ? (iof === top || topOrFirst(top.items[0])) : false; };
      disable('move up', topOrFirst(topItem));
      var topOrLast = function (top) { return top ? (iof === top || topOrLast(_.last(top.items))) : false; };
      disable('move down', topOrLast(topItem));
      disable('copy', false);
      disable('copy items', iof.items.length === 0);
      disable('delete', iof === topItem);
      disable('delete items', iof.items.length === 0);
      disable('search', iof.items.length === 0);
      disable('command mode', false);
    } else {
      disable('zoom in', true);
      disable('zoom out', true);
      disable('expand', true);
      disable('collapse', true);
      disable('indent', true);
      disable('outdent', true);
      disable('move up', true);
      disable('move down',true);
      disable('copy', true);
      disable('copy items', true);
      disable('delete', true);
      disable('delete items', true);
      disable('search', true);
      disable('command mode', true);
    }
    disable('undo', !undoManager.hasUndo());
    disable('redo', !undoManager.hasRedo());
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
    // TODO make pin command menu a real command
    if (e.target.title === 'pin command menu') {
      footerEl.css({bottom: 0, opacity: 1});
      $('[title="pin command menu"]').attr('title', 'unpin command menu');
      $('.' + commandIcons.pin)
        .addClass(commandIcons.unpin)
        .removeClass(commandIcons.pin)
        .css('margin', commandIconMargins.unpin);
      sessionStorage.commandMenuPin = '1';
    } else if (e.target.title === 'unpin command menu') {
      footerEl.css({bottom: '', opacity: ''});
      $('[title="unpin command menu"]').attr('title', 'pin command menu');
      $('.' + commandIcons.unpin)
        .addClass(commandIcons.pin)
        .removeClass(commandIcons.unpin)
        .css('margin', commandIconMargins.pin);
      sessionStorage.commandMenuPin = '0';
    } else if (iof) {
      iof.$('.input:first').focus();
      window.requestAnimationFrame(function () {
        iof.executeCommand(e.target.title);
      });
    }
  });
  eventHub.on('itemOfFocusChange', function (newIOF) {
    var prevIOF = iof;
    iof = newIOF;
    refreshState();
  });
  return {

  }
})
