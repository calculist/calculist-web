calculist.register('transaction', ['_','eventHub'], function (_, eventHub) {

  var debouncedFn, debouncedTimeout,
      transactionInProgress = false,
      stalling = false,
      concludeDebouncedTransaction,
      _try = function (fn) {
        try {
          fn();
        } catch (e) {
          return e;
        }
      };

  var transaction = function () {
    var fn = _.bind.apply(_, arguments),
        error;
    if (debouncedFn) concludeDebouncedTransaction();
    if (transactionInProgress) {
      error = _try(fn);
    } else {
      transactionInProgress = true;
      eventHub.trigger('transactionstart');
      error = _try(fn);
      if (!stalling) {
        if (debouncedFn) {
          concludeDebouncedTransaction();
        } else {
          transactionInProgress = false;
          eventHub.trigger('transactionend');
        }
      }
    }
    if (error) throw error;
  };

  concludeDebouncedTransaction = function () {
    clearTimeout(debouncedTimeout);
    debouncedTimeout = null;
    var error;
    if (debouncedFn) {
      error = _try(debouncedFn);
      debouncedFn = null;
      transactionInProgress = false;
      eventHub.trigger('transactionend');
      if (error) throw error;
    }
  };

  transaction.debounced = function () {
    debouncedFn = _.bind.apply(_, arguments);
    if (debouncedTimeout) {
      clearTimeout(debouncedTimeout);
    } else if (!transactionInProgress) {
      transactionInProgress = true;
      eventHub.trigger('transactionstart');
    }
    debouncedTimeout = setTimeout(concludeDebouncedTransaction, 300);
  };

  transaction.start = function () {
    if (debouncedFn) concludeDebouncedTransaction();
    if (transactionInProgress) return;
    transactionInProgress = true;
    eventHub.trigger('transactionstart');
    return true;
  };

  transaction.stall = function () {
    // TODO add some kind of insurance agaist getting stuck in stall mode
    transaction.start();
    stalling = true;
  };

  transaction.end = function () {
    if (debouncedFn) {
      concludeDebouncedTransaction();
    } else if (transactionInProgress) {
      transactionInProgress = false;
      stalling = false;
      eventHub.trigger('transactionend');
    }
  };

  return transaction;

});
