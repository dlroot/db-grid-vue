// db-grid-vue.types.ts
// Vue 3 类型定义 for db-grid

// ============ 列定义 ============
export interface ColDef {
  // 基本属性
  field?: string;
  headerName?: string;
  colId?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  
  // 功能开关
  sortable?: boolean;
  filter?: boolean | string;
  filterType?: 'text' | 'number' | 'date' | 'boolean' | 'set';
  resizable?: boolean;
  hide?: boolean;
  suppressMovable?: boolean;
  
  // 固定列
  pinned?: 'left' | 'right' | 'center' | null;
  
  // 单元格渲染
  cellRenderer?: string | { new(): any } | ((params: CellRendererParams) => any);
  cellClass?: string | string[] | ((params: CellClassParams) => string | string[]);
  cellStyle?: Record<string, any> | ((params: CellStyleParams) => Record<string, any>);
  
  // 单元格编辑
  editable?: boolean | ((params: CellEditableParams) => boolean);
  cellEditor?: string | { new(): any };
  editOnDoubleClick?: boolean;
  
  // 值处理
  valueFormatter?: (params: ValueFormatterParams) => string;
  valueParser?: (params: ValueParserParams) => any;
  valueGetter?: (params: ValueGetterParams) => any;
  valueSetter?: (params: ValueSetterParams) => any;
  
  // 聚合
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'first' | 'last';
  
  // 其他
  checkboxSelection?: boolean;
  headerCheckboxSelection?: boolean;
  rowDrag?: boolean;
  
  // 分组
  rowGroup?: boolean;
  enableRowGroup?: boolean;
  
  // 透视
  pivot?: boolean;
  enablePivot?: boolean;
  
  // 工具提示
  tooltip?: string;
  tooltipComponent?: string;
  
  // 类型
  type?: string | string[];
  cellDataType?: 'text' | 'number' | 'boolean' | 'date' | 'object';
  
  // 默认列定义
  lockPosition?: boolean;
  suppressSizeToFit?: boolean;
  
  // 列组
  children?: ColDef[];
  groupId?: string;
  marriedChildren?: boolean;
  
  // 值映射 (refData)
  refData?: Record<string, string>;
  
  [key: string]: any;
}

// ============ 单元格渲染参数 ============
export interface CellRendererParams {
  value: any;
  data: any;
  node: any;
  rowIndex: number;
  colDef: ColDef;
  column: any;
  $event: any;
  context: any;
  api: GridApi;
  columnApi: any;
}

export interface CellClassParams {
  value: any;
  data: any;
  node: any;
  rowIndex: number;
  colDef: ColDef;
  context: any;
  api: GridApi;
}

export interface CellStyleParams {
  value: any;
  data: any;
  node: any;
  rowIndex: number;
  colDef: ColDef;
  context: any;
  api: GridApi;
}

export interface CellEditableParams {
  value: any;
  data: any;
  node: any;
  rowIndex: number;
  colDef: ColDef;
  column: any;
  api: GridApi;
}

export interface ValueFormatterParams {
  value: any;
  data: any;
  node: any;
  rowIndex: number;
  colDef: ColDef;
  column: any;
  api: GridApi;
}

export interface ValueParserParams {
  value: any;
  data: any;
  oldData: any;
  colDef: ColDef;
  column: any;
  api: GridApi;
}

export interface ValueGetterParams {
  data: any;
  node: any;
  rowIndex: number;
  colDef: ColDef;
  column: any;
  api: GridApi;
}

export interface ValueSetterParams {
  data: any;
  newValue: any;
  oldValue: any;
  node: any;
  colDef: ColDef;
  column: any;
  api: GridApi;
}

// ============ GridApi ============
export interface GridApi {
  // ========== 通用 ==========
  addEventListener(eventType: string, handler: (event: any) => void): void;
  removeEventListener(eventType: string, handler: (event: any) => void): void;
  setRowData(rowData: any[]): void;
  getRowData(): any[];
  setGridOption(key: string, value: any): void;
  getGridOption(key: string): any;
  
  // ========== 选择 ==========
  selectAll(): void;
  deselectAll(): void;
  selectNode(node: any, clearSelection?: boolean): void;
  deselectNode(node: any): void;
  getSelectedNodes(): any[];
  getSelectedRows(): any[];
  getSelectedRowNodes(): any[];
  
  // ========== 排序 ==========
  sortByColumn(colDef: ColDef, sortDirection?: 'asc' | 'desc'): void;
  setSort(field: string, direction: 'asc' | 'desc' | null): void;
  clearSort(): void;
  
  // ========== 筛选 ==========
  setFilterModel(model: Record<string, any>): void;
  getFilterModel(): Record<string, any>;
  setQuickFilter(text: string): void;
  getQuickFilter(): string;
  clearQuickFilter(): void;
  
  // ========== 视图 ==========
  refreshCells(params?: any): void;
  redrawRows(params?: any): void;
  sizeColumnsToFit(): void;
  resetColumnState(): void;
  refreshView(): void;
  
  // ========== 行 ==========
  getDisplayedRowCount(): number;
  getDisplayedRows(): any[];
  getRowNode(id: string): any;
  forEachNode(callback: (node: any) => void): void;
  
  // ========== 滚动 ==========
  ensureIndexVisible(index: number, align?: string): void;
  ensureNodeVisible(node: any, align?: string): void;
  ensureColumnVisible(colId: string): void;
  getViewportInfo(): ViewportInfo;
  
  // ========== Transaction ==========
  applyTransaction(transaction: RowDataTransaction): TransactionResult;
  
  // ========== 树形数据 ==========
  expandNode(nodeId: string): void;
  collapseNode(nodeId: string): void;
  toggleNode(nodeId: string): void;
  expandAll(): void;
  collapseAll(): void;
  isNodeExpanded(nodeId: string): boolean;
  
  // ========== 行分组 ==========
  setRowGroupColumns(fields: string[]): void;
  removeRowGroupColumns(fields?: string[]): void;
  expandGroup(nodeId: string): void;
  collapseGroup(nodeId: string): void;
  toggleGroup(nodeId: string): void;
  expandAllGroups(): void;
  collapseAllGroups(): void;
  
  // ========== 单元格编辑 ==========
  startCellEdit(rowIndex: number, colId: string): void;
  stopCellEdit(cancel?: boolean): void;
  isCellEditing(): boolean;
  
  // ========== 列固定 ==========
  pinColumn(colId: string, side: 'left' | 'right'): void;
  unpinColumn(colId: string): void;
  getPinnedColumns(): { left: ColDef[], right: ColDef[] };
  
  // ========== 行固定 ==========
  pinRow(pinIndex: number, data: any, position?: 'top' | 'bottom'): void;
  unpinRow(pinIndex: number, position?: 'top' | 'bottom'): void;
  getPinnedTopRows(): any[];
  getPinnedBottomRows(): any[];
  clearPinnedRows(position?: 'top' | 'bottom'): void;
  
  // ========== 分页 ==========
  setPageSize(size: number): void;
  setCurrentPage(page: number): void;
  getCurrentPage(): number;
  getTotalPages(): number;
  nextPage(): void;
  previousPage(): void;
  firstPage(): void;
  lastPage(): void;
  getPaginationInfo(): PaginationInfo;
  
  // ========== 导出 ==========
  exportDataAsCsv(params?: ExportParams): string;
  exportDataAsPdf(options?: any): void;
  downloadExcel(options?: ExcelExportOptions): void;
  importCsv(csvText: string, options?: any): void;
  importExcelFile(file: File): Promise<any>;
  
  // ========== 范围选择 & 剪贴板 ==========
  copyToClipboard(data?: any[], columns?: any[]): void;
  cutToClipboard(data?: any[], columns?: any[]): void;
  pasteFromClipboard(): void;
  copySelectedRange(): void;
  
  // ========== 撤销/重做 ==========
  undo(): boolean;
  redo(): boolean;
  canUndo(): boolean;
  canRedo(): boolean;
  
  // ========== 状态持久化 ==========
  getState(): GridState;
  setState(state: GridState): void;
  saveStateToLocalStorage(key?: string): void;
  loadStateFromLocalStorage(key?: string): void;
  
  // ========== 刷新 ==========
  refreshServerSide(): void;
  
  // ========== Overlay ==========
  showLoadingOverlay(message?: string): void;
  hideOverlay(): void;
  showNoRowsOverlay(message?: string): void;
  
  // ========== 服务 ==========
  getRangeSelectionService(): any;
  getUndoRedoService(): any;
  getGridStateService(): any;
  getRowPinningService(): any;
  getColumnTypeService(): any;
  getKeyboardNavigationService(): any;
  getAggregationService(): any;
  
  [key: string]: any;
}

export interface ViewportInfo {
  startRow: number;
  endRow: number;
  visibleRowCount: number;
  scrollTop: number;
  scrollLeft: number;
}

export interface RowDataTransaction {
  add?: any[];
  remove?: any[];
  update?: any[];
  addIndex?: number;
}

export interface TransactionResult {
  added: any[];
  removed: any[];
  updated: any[];
  addedNodes: any[];
  removedNodes: any[];
  updatedNodes: any[];
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
}

export interface GridState {
  columnState?: any;
  filterModel?: any;
  sortModel?: any;
  scrollState?: any;
  rowGroupColumns?: string[];
}

export interface ExportParams {
  fileName?: string;
  sheetName?: string;
  skipRowHeaders?: boolean;
  skipColumnHeaders?: boolean;
  allColumns?: boolean;
  onlySelected?: boolean;
}

export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  rowHeight?: number;
}

// ============ 事件类型 ============
export interface GridReadyEvent {
  api: GridApi;
  columnApi: any;
  type: string;
}

export interface SelectionChangedEvent {
  api: GridApi;
  type: string;
  selectedRows: any[];
  selectedNodes: any[];
}

export interface CellClickedEvent {
  rowIndex: number;
  colDef: ColDef;
  value: any;
  data: any;
  node: any;
  column: any;
  event: any;
  type: string;
}

export interface CellDoubleClickedEvent extends CellClickedEvent {
  // 继承自 CellClickedEvent
}

export interface RowClickedEvent {
  rowIndex: number;
  data: any;
  node: any;
  event: any;
  type: string;
}

export interface RowDoubleClickedEvent extends RowClickedEvent {
  // 继承自 RowClickedEvent
}

export interface SortChangedEvent {
  api: GridApi;
  type: string;
  sortModel: Array<{ colId: string; sort: 'asc' | 'desc' }>;
}

export interface FilterChangedEvent {
  api: GridApi;
  type: string;
  filterModel: Record<string, any>;
}

export interface CellValueChangedEvent {
  rowIndex: number;
  colDef: ColDef;
  value: any;
  oldValue: any;
  data: any;
  node: any;
  type: string;
}

export interface ModelUpdatedEvent {
  api: GridApi;
  type: string;
}

export interface RowDataUpdatedEvent {
  api: GridApi;
  type: string;
}

// ============ GridOptions ============
export interface GridOptions {
  // 数据
  rowData?: any[];
  columnDefs?: ColDef[];
  
  // 行模型
  rowModelType?: 'clientSide' | 'serverSide' | 'infinite';
  
  // 主题
  theme?: string;
  
  // 功能开关
  pagination?: boolean;
  paginationPageSize?: number;
  paginationAutoPageSize?: boolean;
  
  // 选择
  rowSelection?: 'single' | 'multiple' | 'checkbox';
  suppressRowClickSelection?: boolean;
  
  // 排序 & 筛选
  defaultColDef?: Partial<ColDef>;
  
  // 编辑
  enableCellEdit?: boolean;
  editOnDoubleClick?: boolean;
  editOnClick?: boolean;
  stopEditingWhenCellsLoseFocus?: boolean;
  
  // 状态持久化
  stateStorage?: 'localStorage' | 'sessionStorage' | null;
  stateKey?: string;
  autoSaveState?: boolean;
  
  // 其他
  animateRows?: boolean;
  getRowId?: (params: { data: any; index: number }) => string;
  rowHeight?: number;
  headerHeight?: number;
  rowBuffer?: number;
  
  // 国际化
  locale?: string;
  
  // 工具提示
  tooltipShowDelay?: number;
  tooltipHideDelay?: number;
  
  // 撤销/重做
  undoRedo?: boolean;
  undoRedoCellEdit?: boolean;
  
  // 剪贴板
  clipboard?: boolean;
  
  // 范围选择
  rangeSelection?: boolean;
  
  // 右键菜单
  contextMenu?: boolean;
  
  // 行分组
  enableRowGroup?: boolean;
  groupDefaultExpanded?: number;
  
  // 树形数据
  treeData?: boolean;
  treeConfig?: any;
  
  // 透视
  pivotMode?: boolean;
  
  // 列固定
  pinnedLeftColumns?: string[];
  pinnedRightColumns?: string[];
  
  // 行固定
  pinnedTopRowData?: any[];
  pinnedBottomRowData?: any[];
  
  // 侧边栏
  sideBar?: boolean | SideBarConfig;
  
  // 状态栏
  statusBar?: boolean;
  
  // 滚动
  suppressScrollOnNewData?: boolean;
  
  // 渲染
  suppressColumnVirtualisation?: boolean;
  suppressRowVirtualisation?: boolean;
  
  // 快捷键
  suppressKeyboardEvent?: (params: any) => boolean;
  
  [key: string]: any;
}

export interface SideBarConfig {
  toolPanels?: SideBarPanel[];
  defaultToolPanel?: string;
}

export interface SideBarPanel {
  id: string;
  labelKey?: string;
  labelDefault?: string;
  iconKey?: string;
  toolPanel?: any;
  toolPanelParams?: any;
}

// ============ Vue 组件实例 ============
export interface DbGridVueInstance {
  getApi(): GridApi | null;
  getColumnApi(): any | null;
  refreshView(): void;
  exportDataAsCsv(params?: ExportParams): string;
}

// ============ Composable 返回类型 ============
export interface UseDbGridReturn {
  gridApi: Ref<GridApi | null>;
  gridRef: Ref<DbGridVueInstance | null>;
  loading: Ref<boolean>;
  data: Ref<any[]>;
  selectedRows: Ref<any[]>;
  selectedNodes: Ref<any[]>;
  currentPage: Ref<number>;
  totalPages: Ref<number>;
  paginationInfo: Ref<PaginationInfo | null>;
  isReady: Ref<boolean>;
  
  // 操作方法
  setRowData: (data: any[]) => void;
  setColumns: (columns: ColDef[]) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => void;
  exportData: (format: 'csv' | 'excel' | 'pdf', params?: any) => void;
  undo: () => boolean;
  redo: () => boolean;
  
  // 选择方法
  selectAll: () => void;
  deselectAll: () => void;
  getSelectedRows: () => any[];
  
  // 排序 & 筛选
  setSort: (field: string, direction: 'asc' | 'desc' | null) => void;
  setQuickFilter: (text: string) => void;
  
  // 分页
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
}
