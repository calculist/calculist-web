import _ from 'lodash';
import computationIsPaused from '../../client/services/computationIsPaused';

const commands_resumeComputation = (function (computationIsPaused) {
  return function () {
    computationIsPaused.resume();
  };
})(computationIsPaused);

const commands_unpauseComputation = (_.identity)(commands_resumeComputation);

export { commands_resumeComputation, commands_unpauseComputation };
