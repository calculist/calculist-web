declare const confetti: {
  maxCount: number;
  speed: number;
  frameInterval: number;
  alpha: number;
  start: (timeout?: number) => void;
  stop: () => void;
};
export default confetti;
