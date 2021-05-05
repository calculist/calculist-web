calculist.register('footerMenu', ['_','eventHub', 'emojiHelper'], function (_, eventHub, emojiHelper) {
  var devMode = false;
  var isMobileDevice = navigator.userAgent.toLowerCase().match(/mobile/i);
  if (!devMode && !isMobileDevice) {
    $('#footer').hide();
    return {};
  }
  var commands = [
    'zoom in', 'zoom out',
    'expand', 'collapse',
    'indent', 'outdent',
    'move up', 'move down',
    'delete', 'duplicate',
    'undo','redo',
    'search', 'enter command mode',
    // 'copy', 'paste',
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
    'expand': 'gg-arrows-shrink-v',
    'collapse': 'gg-arrows-merge-alt-v',
    'search': 'gg-search',
    'delete': 'gg-trash',
    'enter command mode': 'gg-terminal',
    'copy': 'gg-copy',
    'duplicate': 'gg-duplicate',
    'outdent straight': 'gg-move-left',
    'indent siblings': 'gg-move-task',
  };
  var commandIconMargins = {
    'indent': '-1px auto 0 -4px',
    'outdent': '-1px auto 0 1px',
    'move down': '-3px auto 0 auto',
    'delete': '5px auto 0 auto',
    'duplicate': '7px auto 0 2px',
    'undo': '3px auto',
    'redo': '3px auto',
    'enter command mode': '0 -2px',
  }
  var iof = null;
  var footerEl = $('#footer');
  var commandEls = commands.map(function (command, i) {
    var secondOfPair = i % 2 || command === 'move up';
    return '<span  title="' + command +
      '" style="display: inline-block; cursor: pointer; margin: 5px 0 5px ' +
      (secondOfPair ? '-1px' : '5px') +
      '; padding: 5px; border: 1px solid #aaa; height: 20px; width: 20px;">' +
      (
        commandIcons[command] ?
          (
            '<i style="margin:' +
            (commandIconMargins[command] ? commandIconMargins[command] : '0 auto') +
            ';" class="' + commandIcons[command] + '" title="' + command + '" ></i>'
          ) :
          command
      ) +
    '</span>';
  });
  footerEl.html(commandEls).on('click', function (e) {
    e.preventDefault();
    console.log(e.target.title, iof && iof.text);
    if (iof) {
      iof.executeCommand(e.target.title);
    }
  });
  footerEl.css({
    display: iof ? 'block' : 'none',
    position: 'fixed',
    bottom: 0,
    background: '#fff',
    width: '100%',
    'z-index': '1000',
    height: '50px',
    'white-space': 'nowrap',
    'overflow-x': 'scroll',
    'box-shadow': '0 0 3px rgba(0, 0, 0, 0.2)',
  })
  eventHub.on('itemOfFocusChange', function (newIOF) {
    var prevIOF = iof;
    iof = newIOF;
    // console.log('iof change ', iof);
    if (iof && !prevIOF) {
      footerEl.show();
    } else if (!iof) {
      footerEl.hide();
    }
  });
  eventHub.on('item.handleBlur:before', function (blurItem) {
    // TODO Hide menu when keyboard is not present.
  });
  return {

  }
})
