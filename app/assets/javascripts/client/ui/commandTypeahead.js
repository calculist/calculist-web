calculist.register('commandTypeahead', ['_','eventHub'], function (_, eventHub) {

  var UP = 38, DOWN = 40;

  var commandStack = (sessionStorage.commandStack ? JSON.parse(sessionStorage.commandStack) : []) || [],
      stackIndex = 0,
      availableCommands = [
        'template ""','make template ""',
        'add text ""','add prefix ""','remove text ""','replace text "", ""','change text ""',
        'import from csv','import from json','import from txt',
        'duplicate','expand all','collapse all','expand siblings',
        'collapse siblings','indent siblings','outdent items','outdent straight',
        'sort items by ""','group items by ""','ungroup items ""','ungroup',
        'pivot items',
        'shuffle items', 'for each item,','for each item recursively,','reverse items','delete items',
        'move to list ""','split to list ""','delete',
        'zoom in','zoom out','move up','move down','up','down',
        'toggle collapse','indent','outdent',
        'expand','collapse','freeze computed value',
        'goto list','go home','goto item ""','follow link',
        'download as txt','download as computed txt','download as csv','download backup',
        'new list ""','copy to clipboard','copy to clipboard "computed"','copy to clipboard "formatted"',
        'copy to clipboard "hide collapsed"','copy items to clipboard',
        'change theme "dark"','change theme "light"','change theme "sandcastle"',
        'search for ""','change font ""','change font "Courier New"','change font "Source Code Pro"',
      ],
      availableCommandsWithForEachPrefix = [
        'template ""','add text ""','add prefix ""','remove text ""','replace text "", ""','change text ""',
        'duplicate','sort items by ""','group items by ""','shuffle items','reverse items','delete items',
        'pivot items','move to list ""', 'split to list ""','freeze computed value',
      ].map(function (c) { return 'for each item, ' + c; }),
      matches = [],
      selectedCommandIndex = -1,
      $el = null;

  _.each(window.OTHER_LISTS, function (otherList) {
    availableCommands.push('goto list "' + otherList.title + '"');
    if (otherList.handle !== 'preferences') availableCommands.push('permanently delete list "' + otherList.title  + '"');
  });

  var getEl = function () {
    if ($el) return $el;
    $el = $('<pre id="command-typeahead-menu"></pre>');
    $('#main-container').append($el);
    return $el;
  };

  var scanningHistory = function (e) {
    if (e.which === UP) {
      e.preventDefault();
      stackIndex = stackIndex === 0 ? (commandStack.length - 1) : (stackIndex - 1);
      e.target.textContent = commandStack[stackIndex];
    } else if (e.which === DOWN) {
      e.preventDefault();
      stackIndex = stackIndex === 0 ? (commandStack.length - 1) : (stackIndex - 1);
      e.target.textContent = commandStack[stackIndex];
    }
  };

  var renderMatches = function () {
    var m = matches.map(function (match, i) {
      if (i === selectedCommandIndex) {
        var style = 'color: #ff2; width: 100%; background-color: #333;' +
                    'display: inline-block;';
        return '<span style="' + style + '">' + match + '</span>';
      } else {
        return '<span>' + match + '</span>';
      }
    });
    getEl().html(m.join('<br/>'));
  };

  var typing = function (e) {
    var text = _.trim(e.target.textContent);
    if (text) {
      selectedCommandIndex = -1;
      var options = _.union(_.takeRight(commandStack, 20), availableCommands);
      if (_.includes(text, 'for each item,')) {
        _.remove(options, function (option) {
          return option === 'for each item,' || _.includes(option, 'for each item recursively,');
        });
        options = options.concat(availableCommandsWithForEachPrefix);
      } else if (_.includes(text, 'for each item recursively,')) {
        _.remove(options, function (option) {
          return _.includes(option, 'for each item,');
        });
      }
      matches = _.filter(options, function (o) { return _.includes(o, text); });
      matches = _.sortBy(matches, 'length');
      matches = _.sortBy(matches, _.method('indexOf', text));
      // if (matches.length < 5) {
      //   var letters = text.split('');
      //   var scoreCount = 0;
      //   var fuzzyMatches = _.sortBy(_.difference(options, matches), function (match) {
      //     var score = 0;
      //     _.each(letters, function (letter, letterIndex) {
      //       var i = match.indexOf(letter);
      //       if (i === -1) return;
      //       score -= (match.length - i) + (letters.length - letterIndex);
      //       if (i === 0 && letterIndex === 0) score -= 100;
      //     });
      //     if (score) ++scoreCount;
      //     return score;
      //   });
      //   matches.push.apply(matches, _.take(fuzzyMatches, Math.min(scoreCount, 5)));
      // }
    } else {
      matches = [];
    }
    var $target = $(e.target);
    var offset = $target.offset();
    getEl().show().css({
      width: $target.width(),
      top: offset.top + $target.height() + 9,
      left: offset.left,
    });
    renderMatches();
  };

  var selectingFromDropdown = function (e) {

  };

  eventHub.on('item.enterCommandMode', function (item) {
    // console.log('enterCommandMode');
    matches = [];
    selectedCommandIndex = -1;
    stackIndex = commandStack.length;
  });

  eventHub.on('item.exitCommandMode', function (item) {
    // console.log('exitCommandMode');
    $el && $el.remove();
    $el = null;
  });

  return {
    update: function (e) {
      // TODO, get rid of this method
      if (e.which === UP || e.which === DOWN) {
        if (e.which === UP && selectedCommandIndex < 0) {
          scanningHistory(e);
        } else if (e.which === UP) {
          selectedCommandIndex -= 1;
          e.preventDefault();
          e.target.textContent = matches[selectedCommandIndex];
          renderMatches();
        } else if (e.which === DOWN) {
          selectedCommandIndex = (selectedCommandIndex + 1) % matches.length;
          e.preventDefault();
          e.target.textContent = matches[selectedCommandIndex];
          renderMatches();
        } else {
          selectedCommandIndex = -1;
        }
        var range = document.createRange();
        var sel = window.getSelection();
        var i = _.indexOf(e.target.textContent, '"');
        i = i === -1 ? e.target.textContent.length : i + 1;
        range.setStart(e.target.childNodes[0], i);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        _.defer(typing, e);
      }
    },
    getTopMatch: function () {
      return matches[0];
    },
    getLastCommand: function () {
      return _.last(commandStack);
    },
    end: function (command) {
      // console.log(command);
      if (command && command !== _.last(commandStack)) {
        commandStack.push(command);
        if (commandStack.length > 100) commandStack.shift();
        sessionStorage.commandStack = JSON.stringify(commandStack);
      }
    }
  };

});
