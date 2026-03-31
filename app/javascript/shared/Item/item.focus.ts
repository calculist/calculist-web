import _ from 'lodash';

const item_focus = (function (_) {

  return _.debounce(function() { this.$("#input" + this.id).focus(); });

})(_);

export default item_focus;
