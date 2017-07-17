calculist.register('item.showLinkButtons', ['_','$','urlFinder','itemOfFocus'], function (_, $, urlFinder, itemOfFocus) {

  var externalLinkIcon = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAVklEQVR4Xn3PgQkAMQhDUXfqTu7kTtkpd5RA8AInfArtQ2iRXFWT2QedAfttj2FsPIOE1eCOlEuoWWjgzYaB/IkeGOrxXhqB+uA9Bfcm0lAZuh+YIeAD+cAqSz4kCMUAAAAASUVORK5CYII=">';

  var removeLinkButtons = function (_this) {
    if (_this.$linkButtons) {
      _this.$linkButtons.remove();
      _this.$linkButtons = null;
    }
  };

  return function () {
    if (itemOfFocus.is(this)) {
      this.valueOf();
      var text = this.key + ' ' + (this.val || '');
      var urls = urlFinder.getUrls(text);
      if (!urls || !urls.length) {
        removeLinkButtons(this);
        return;
      }
      if (!this.$linkButtons) {
        this.$linkButtons = $('<div class="link-buttons"></div>');
        this.$el.prepend(this.$linkButtons);
      }
      this.$linkButtons.html(
        _.map(urls, function (url) {
          return '<a href="' + url + '" target="_blank" title="' + url + '">' + externalLinkIcon + '</a> ';
        }).join('')
      );
    } else if (this.$linkButtons) {
      removeLinkButtons(this);
    }
  };
});
