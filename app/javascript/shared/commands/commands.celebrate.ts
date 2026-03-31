import confetti from '../../vendor/confetti';
import headerMessage from '../../client/ui/headerMessage';

const commands_celebrate = (function (confetti, headerMessage) {
  return function (_this, message) {
    if (message) headerMessage.flashMessage(message, 6000);
    confetti.start(3000, 300);
  };
})(confetti, headerMessage);

export default commands_celebrate;
