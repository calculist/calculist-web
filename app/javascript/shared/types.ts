/**
 * Core type definitions for calculist.
 *
 * NOTE: The Item class is defined via a complex IIFE/prototype pattern
 * that doesn't lend itself to a TypeScript class declaration. Instead,
 * we define an IItem interface describing the shape of Item instances,
 * and use it throughout the codebase for type safety.
 */

/** The result of parseItemText() */
export interface ParsedItemText {
  text: string;
  key: string;
  val: string | null;
  separator: string | null;
}

/** Options passed to the Item constructor / initialize() */
export interface ItemOptions {
  guid: string;
  text?: string;
  parent?: IItem | null;
  collapsed?: boolean;
  sort_order?: number;
  items?: (ItemOptions | IItem)[];
  invisible?: boolean;
}

/** The shape of an Item instance */
export interface IItem {
  // Core properties (set in initialize)
  guid: string;
  id: string;
  text: string;
  parent: IItem | null;
  depth: number;
  collapsed: boolean;
  sort_order: number;
  items: IItem[];
  invisible?: boolean;

  // Computed properties (set in valueOf)
  key: string;
  val: any;
  _valueOf: any;
  hasVal: boolean;
  valIsComputed: boolean;
  hasVariableReference: boolean;
  parsedText: ParsedItemText | null;
  evalFn: ((ctx: any) => any) | null;
  lastAnimationFrame: number;
  isComputingValue: boolean;
  wasCollapsed: boolean;

  // Backbone.View properties
  $el: JQuery;
  el: HTMLElement;
  $(selector: string): JQuery;

  // Tree navigation
  $lastItem(key: string, attributeName?: string): IItem | undefined;
  $$item(key: string): IItem | undefined;
  $siblings(): IItem[];
  getTotalItemCount(): number;
  getUpperSibling(child: IItem): IItem | undefined;
  getNextSibling(child?: IItem): IItem | undefined;
  getUpperItemAtDepth(child: IItem, depth: number, includeCollapsed?: boolean): IItem | undefined;
  getNextItemAtDepth(child: IItem, depth: number, includeCollapsed?: boolean): IItem | undefined;

  // Tree mutation
  removeChild(child: IItem): void;
  insertAt(child: IItem, i: number): void;
  insertAfter(child: IItem, otherChild: IItem): boolean;
  insertBefore(child: IItem, otherChild: IItem): void;
  refreshDepth(): void;
  clone(parent: IItem): IItem;
  deleteItem(youAreSure?: boolean): boolean | undefined;

  // Serialization
  toJSON(): ItemJSON;
  toClonedJSON(): ItemJSON;
  toFlatJSON(): ItemFlatJSON;
  toFlatJSON_v2(): ItemFlatJSON_v2;
  toText(depth?: number, options?: ToTextOptions): string;

  // Display
  showTrueValue(): void;
  toggleCollapse(): void;
  getComputedText(): string;
  getComputedHTML(): string;
  formatKey(): string;
  formatVal(): string;

  // Rendering
  render(): IItem;
  renderChildren(): void;
  focus(): void;
  expand(expandParents?: boolean, skipRender?: boolean): Promise<void>;
  collapse(skipAnimation?: boolean): Promise<void>;

  // Operations
  save(): void;
  valueOf(): any;
  toString(): string;
  initialize(options: ItemOptions): void;
  refreshSortOrder(): void;
  assignLocalVar(name: string, val: any): void;
  $item(key: string): IItem | undefined;
  getTopItem(): IItem;
  ensureGuidsAreUnique(): void;
  indent(): void;
  outdent(): void;
  moveUp(): void;
  moveDown(): void;
  flatten(): IItem[];
  flatten_v2(): IItem[];
  _flatten(result: IItem[]): IItem[];
  toMarkdown(): string;
  toHTML(): string;
  applyDelta(delta: any): void;
  sortItemsBy(key: string): void;
  groupItemsBy(key: string): void;
  format(formatString: string): string;
  formatNumber(n: number): string;
  getComputed(): string;
  handleFocus(e: any): void;

  // Allow additional dynamic properties
  [key: string]: any;
}

/** Options for toText() */
export interface ToTextOptions {
  computed?: boolean;
  hideCollapsed?: boolean;
  prependGuid?: boolean;
}

/** Output of toJSON() / toClonedJSON() */
export interface ItemJSON {
  text: string;
  collapsed: boolean;
  sort_order: number;
  guid: string;
  items: ItemJSON[];
}

/** Output of toFlatJSON() */
export interface ItemFlatJSON {
  text: string;
  items: string;
  collapsed: boolean;
  sort_order: number;
  guid: string;
}

/** Output of toFlatJSON_v2() */
export interface ItemFlatJSON_v2 {
  text: string;
  parent_guid: string | null;
  is_collapsed: boolean;
  sort_order: number;
  guid: string;
}

/** The itemOfFocus API */
export interface ItemOfFocusAPI {
  change(item: IItem | null): void;
  defocusAndCallout(item: IItem): void;
  get(): IItem | undefined;
  is(item: IItem): boolean;
}

/** The itemOfDrag API */
export interface ItemOfDragAPI {
  change(item: IItem): void;
  changeTarget(target: IItem, direction: 'above' | 'below'): void;
  get(): IItem | undefined;
}
