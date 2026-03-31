calculist.register('item.showLinkButtons', ['_','$','urlFinder','itemOfFocus','zoomPage', 'slashElementsHelper'], function (_, $, urlFinder, itemOfFocus, zoomPage, slashElementsHelper) {

  var externalLinkIcon = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=">';

  var removeLinkButtons = function (_this) {
    if (_this.$linkButtons) {
      _this.$linkButtons.remove();
      _this.$linkButtons = null;
    }
  };

  return function () {
    this.valueOf();
    var text = this.key + ' ' + (this.val || '');
    var urls = urlFinder.getUrls(text) || [];
    // TODO create ref/id network service
    var ids = text.match(/\\id\[[a-zA-Z0-9\-_]+\]/g) || [];
    var refs = text.match(/\\ref\[[a-zA-Z0-9\-_]+\]/g) || [];
    var commands = slashElementsHelper.parseSlashCommands(text);
    if (!(urls.length || ids.length || refs.length || commands.length) || !zoomPage.isInPage(this)) {
      removeLinkButtons(this);
      return;
    }
    commands = commands.concat(ids.map(function (id) {
      id = id.split(/\[|\]/g)[1];
      return 'copy "' + id + '"';
    })).concat(refs.map(function (ref) {
      var id = ref.split(/\[|\]/g)[1];
      return 'goto "' + id + '"';
    }));
    if (!this.$linkButtons) {
      this.$linkButtons = $('<div class="link-buttons"></div>');
    }
    this.$el.prepend(this.$linkButtons);
    this.$linkButtons.html(
      '<span class="command-menu-container">' +
        // '<span class="command-menu-icon"></span>' +
        // '<span class="command">zoom in</span>' +
        commands.map(function (command) {
          return '<span class="command">' + _.escape(command) + '</span>';
        }).join('') +
      '</span>' +
      // ids.map(function (id) {
      //   id = id.split(/\[|\]/g)[1];
      //   return '<span title="copy ( \'\\ref[' + id + ']\' )" class="tag">' + id + '</span>';
      // }).join('') +
      // refs.map(function (ref) {
      //   var id = ref.split(/\[|\]/g)[1];
      //   return '<span title="goto ( \'' + id + '\' )" class="tag">' + id + '</span>';
      // }).join('') +
      _.map(urls, function (url) {
        return '<a href="' + url + '" target="_blank" title="' + url + '">' + externalLinkIcon + '</a> ';
      }).join('')
    );
    if (itemOfFocus.is(this)) {
      this.$linkButtons.addClass('focus');
    } else {
      this.$linkButtons.removeClass('focus');
    }
    if (window.FILE_PATH) {
      // desktop
      this.$linkButtons.find('a').on('click', function (e) {
        e.preventDefault();
        var shell = require('electron').shell;
        shell.openExternal(e.currentTarget.href);
      });
    }
  };
});
