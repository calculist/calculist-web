import _ from 'lodash';
import transaction from '../../client/services/transaction';

const item_handleDotClick = (function (_, transaction) {

  return function (e) {
    transaction(this.toggleCollapse, this);
  };

})(_, transaction);

export default item_handleDotClick;
