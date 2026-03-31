import _ from 'lodash';
import parseTextDoc from '../Item/parseTextDoc';

const calculistFileFormatter = (function (_, parseTextDoc) {

  return {
    toCalculistFile: function (topItem) {
      return JSON.stringify(topItem, null, ' ');
    },
    parseFile: function (fileString) {
      return parseTextDoc(fileString, {withGuids: true});
    }
  }
})(_, parseTextDoc);

export default calculistFileFormatter;
