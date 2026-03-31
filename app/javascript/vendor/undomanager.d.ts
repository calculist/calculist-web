declare class UndoManager {
  add(undoObj: { undo: () => void; redo: () => void }): void;
  undo(): void;
  redo(): void;
  clear(): void;
  hasUndo(): boolean;
  hasRedo(): boolean;
  getIndex(): number;
  setLimit(limit: number): void;
}
export default UndoManager;
