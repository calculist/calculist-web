calculist.register('searchQueryParser', ['_'], function (_) {
  var sqp = {};
  sqp.termPattern = /-?(?:[^\s"']+|"[^"]*"|'[^']*')/g;
  sqp.getTerms = function (string) { return string.match(sqp.termPattern); };
  sqp.getTermProperties = function (term) {
    var isNegation = term[0] === '-';
    if (isNegation) term = term.substring(1);
    var isQuoted = (term[0] === '"' && term[term.length - 1] === '"') ||
                   (term[0] === "'" && term[term.length - 1] === "'");
    if (isQuoted) term = term.substring(1, term.length - 1);
    var patternString = _.escapeRegExp(term);
    var pattern = new RegExp(patternString, 'i');
    var predicate = isNegation ?
      function (item) { return !pattern.test(item.text); } :
      function (item) { return pattern.test(item.text); };
    return {
      isNegation: isNegation,
      isQuoted: isQuoted,
      patternString: patternString,
      pattern: pattern,
      predicate: predicate,
    }
  };
  sqp.getHighlightPattern = function (termProps) {
    var patternStrings = termProps.reduce(function (ps, tp) {
      if (!tp.isNegation) ps.push(tp.patternString);
      return ps;
    }, []);
    return new RegExp('(?:' + patternStrings.join(')|(?:') + ')', 'i');
  };
  sqp.parse = function (query) {
    var predicate, queryString, highlightPattern;
    if (_.isFunction(query)) {
      predicate = query;
      queryString = query.toString();
      highlightPattern = null;
    } else {
      var terms = sqp.getTerms(query);
      var termProps = terms.map(sqp.getTermProperties);
      predicate = function (item) {
        return termProps.reduce(function (m, p) {
          return m && p.predicate(item);
        }, true);
      };
      queryString = query;
      highlightPattern = sqp.getHighlightPattern(termProps);
    }
    return {
      predicate: predicate,
      queryString: queryString,
      highlightPattern: highlightPattern,
    };
  };

  Object.freeze(sqp);
  return sqp;
});
