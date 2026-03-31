const wordWrap = {
  getLines: function(string: string, width: number): string[] {
    string || (string = '');
    var reg = new RegExp('.{1,' + Math.floor(width) + '}([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)', 'g');
    return string.match(reg) || [];
  }
};

export default wordWrap;
