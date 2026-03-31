declare class UndoManager {
  add(undoObj: { undo: () => void; redo: () => void }): void;
  undo(): void;
  redo(): void;
  clear(): void;
  hasUndo(): boolean;
  hasRedo(): boolean;
}
export default UndoManager;
