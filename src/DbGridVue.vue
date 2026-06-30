<template>
  <div 
    ref="containerRef" 
    :class="['db-grid-vue-wrapper', className]" 
    :style="containerStyle"
  >
    <!-- db-grid web component -->
    <db-grid-element 
      ref="gridElement"
      :row-data="rowData"
      :column-defs="columnDefs"
      :grid-options="mergedGridOptions"
      :height="resolvedHeight"
      :width="resolvedWidth"
      :theme="theme"
      :pagination="pagination"
      :pagination-page-size="paginationPageSize"
      :enable-cell-edit="enableCellEdit"
      :edit-on-double-click="editOnDoubleClick"
      :enable-row-drag="rowDragEnabled"
      :enable-range-selection="rangeSelection"
      :undo-redo="undoRedo"
      :quick-filter-text="quickFilterText"
      :locale="locale"
      @grid-ready="onGridReady"
      @selection-changed="onSelectionChanged"
      @cell-clicked="onCellClicked"
      @cell-double-clicked="onCellDoubleClicked"
      @row-clicked="onRowClicked"
      @row-double-clicked="onRowDoubleClicked"
      @sort-changed="onSortChanged"
      @filter-changed="onFilterChanged"
      @cell-value-changed="onCellValueChanged"
      @model-updated="onModelUpdated"
      @row-data-updated="onRowDataUpdated"
    />
    
    <!-- Loading overlay slot -->
    <div v-if="$slots.loading" class="db-grid-vue-loading">
      <slot name="loading" />
    </div>
    
    <!-- No rows overlay slot -->
    <div v-if="$slots.noRows" class="db-grid-vue-no-rows">
      <slot name="noRows" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, toRaw } from 'vue';
import type { 
  ColDef, 
  GridApi, 
  GridReadyEvent,
  CellClickedEvent,
  RowClickedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  CellValueChangedEvent,
  ModelUpdatedEvent,
  RowDataUpdatedEvent,
  GridOptions,
  UseDbGridReturn
} from './db-grid-vue.types';

// ============ Props ============
const props = withDefaults(defineProps<{
  // 数据
  rowData?: any[];
  columnDefs?: ColDef[];
  
  // 尺寸
  height?: number | string;
  width?: number | string;
  
  // 功能开关
  pagination?: boolean;
  paginationPageSize?: number;
  paginationAutoPageSize?: boolean;
  
  // 选择
  rowSelection?: 'single' | 'multiple' | 'checkbox';
  suppressRowClickSelection?: boolean;
  
  // 编辑
  enableCellEdit?: boolean;
  editOnDoubleClick?: boolean;
  editOnClick?: boolean;
  
  // 行拖拽
  rowDragEnabled?: boolean;
  
  // 范围选择
  rangeSelection?: boolean;
  
  // 撤销/重做
  undoRedo?: boolean;
  
  // 快速筛选
  quickFilterText?: string;
  
  // 主题
  theme?: string;
  
  // 国际化
  locale?: string;
  
  // 状态持久化
  stateStorage?: 'localStorage' | 'sessionStorage' | null;
  stateKey?: string;
  autoSaveState?: boolean;
  
  // 其他
  animateRows?: boolean;
  getRowId?: (params: { data: any; index: number }) => string;
  rowHeight?: number;
  headerHeight?: number;
  
  // GridOptions 合并
  gridOptions?: GridOptions;
  
  // 自定义样式
  className?: string;
  style?: Record<string, any>;
}>(), {
  height: 500,
  width: '100%',
  pagination: false,
  paginationPageSize: 10,
  rowSelection: 'multiple',
  enableCellEdit: false,
  editOnDoubleClick: true,
  rowDragEnabled: false,
  rangeSelection: false,
  undoRedo: false,
  animateRows: true,
  rowHeight: 40,
  headerHeight: 44,
});

// ============ Emits ============
const emit = defineEmits<{
  gridReady: [event: GridReadyEvent];
  selectionChanged: [selectedRows: any[], selectedNodes: any[]];
  cellClicked: [event: CellClickedEvent];
  cellDoubleClicked: [event: CellClickedEvent];
  rowClicked: [event: RowClickedEvent];
  rowDoubleClicked: [event: RowClickedEvent];
  sortChanged: [event: SortChangedEvent];
  filterChanged: [event: FilterChangedEvent];
  cellValueChanged: [event: CellValueChangedEvent];
  modelUpdated: [event: ModelUpdatedEvent];
  rowDataUpdated: [event: RowDataUpdatedEvent];
}>();

// ============ Refs ============
const containerRef = ref<HTMLDivElement | null>(null);
const gridElement = ref<any>(null);
const gridApi = ref<GridApi | null>(null);
const isReady = ref(false);

// ============ Computed ============
const resolvedHeight = computed(() => {
  if (typeof props.height === 'number') return `${props.height}px`;
  return props.height;
});

const resolvedWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`;
  return props.width;
});

const containerStyle = computed(() => ({
  height: resolvedHeight.value,
  width: resolvedWidth.value,
  position: 'relative',
  ...props.style,
}));

const mergedGridOptions = computed<GridOptions>(() => {
  return {
    // 从 props 合并
    rowData: props.rowData,
    columnDefs: props.columnDefs,
    pagination: props.pagination,
    paginationPageSize: props.paginationPageSize,
    paginationAutoPageSize: props.paginationAutoPageSize,
    rowSelection: props.rowSelection,
    suppressRowClickSelection: props.suppressRowClickSelection,
    enableCellEdit: props.enableCellEdit,
    editOnDoubleClick: props.editOnDoubleClick,
    editOnClick: props.editOnClick,
    rowDragEnabled: props.rowDragEnabled,
    rangeSelection: props.rangeSelection,
    undoRedo: props.undoRedo,
    quickFilterText: props.quickFilterText,
    theme: props.theme,
    locale: props.locale,
    stateStorage: props.stateStorage,
    stateKey: props.stateKey,
    autoSaveState: props.autoSaveState,
    animateRows: props.animateRows,
    getRowId: props.getRowId,
    rowHeight: props.rowHeight,
    headerHeight: props.headerHeight,
    // 从 gridOptions 合并
    ...props.gridOptions,
  };
});

// ============ 生命周期 ============
onMounted(async () => {
  await nextTick();
  await loadDbGridElement();
});

onBeforeUnmount(() => {
  // 清理工作由 web component 自动处理
});

// ============ 方法 ============
let dbGridLoaded = false;

const loadDbGridElement = async () => {
  if (dbGridLoaded) return;
  
  // 等待 db-grid-element 自定义元素注册
  const maxRetries = 50;
  let retries = 0;
  
  while (retries < maxRetries) {
    if (customElements.get('db-grid-element')) {
      dbGridLoaded = true;
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  console.warn('[DbGridVue] db-grid-element not loaded after 5s, some features may not work');
};

const onGridReady = (event: CustomEvent) => {
  const detail = event.detail;
  gridApi.value = detail.api;
  isReady.value = true;
  
  emit('gridReady', {
    api: detail.api,
    columnApi: detail.columnApi,
    type: 'gridReady',
  });
};

const onSelectionChanged = (event: CustomEvent) => {
  if (gridApi.value) {
    const selectedRows = gridApi.value.getSelectedRows();
    const selectedNodes = gridApi.value.getSelectedNodes();
    emit('selectionChanged', selectedRows, selectedNodes);
  }
};

const onCellClicked = (event: CustomEvent) => {
  emit('cellClicked', normalizeCellEvent(event.detail));
};

const onCellDoubleClicked = (event: CustomEvent) => {
  emit('cellDoubleClicked', normalizeCellEvent(event.detail));
};

const onRowClicked = (event: CustomEvent) => {
  emit('rowClicked', normalizeRowEvent(event.detail));
};

const onRowDoubleClicked = (event: CustomEvent) => {
  emit('rowDoubleClicked', normalizeRowEvent(event.detail));
};

const onSortChanged = (event: CustomEvent) => {
  emit('sortChanged', {
    api: event.detail.api,
    type: 'sortChanged',
    sortModel: event.detail.sortModel || [],
  });
};

const onFilterChanged = (event: CustomEvent) => {
  emit('filterChanged', {
    api: event.detail.api,
    type: 'filterChanged',
    filterModel: event.detail.filterModel || {},
  });
};

const onCellValueChanged = (event: CustomEvent) => {
  emit('cellValueChanged', normalizeCellEvent(event.detail));
};

const onModelUpdated = (event: CustomEvent) => {
  emit('modelUpdated', {
    api: event.detail.api,
    type: 'modelUpdated',
  });
};

const onRowDataUpdated = (event: CustomEvent) => {
  emit('rowDataUpdated', {
    api: event.detail.api,
    type: 'rowDataUpdated',
  });
};

// 规范化事件数据
const normalizeCellEvent = (detail: any): CellClickedEvent => ({
  rowIndex: detail.rowIndex ?? 0,
  colDef: detail.colDef ?? {},
  value: detail.value,
  data: detail.data,
  node: detail.node,
  column: detail.column,
  event: detail.event,
  type: detail.type,
});

const normalizeRowEvent = (detail: any): RowClickedEvent => ({
  rowIndex: detail.rowIndex ?? 0,
  data: detail.data,
  node: detail.node,
  event: detail.event,
  type: detail.type,
});

// ============ 公开 API ============
const getApi = (): GridApi | null => {
  return gridApi.value;
};

const refresh = () => {
  gridApi.value?.refreshView();
};

const refreshCells = (params?: any) => {
  gridApi.value?.refreshCells(params);
};

const redrawRows = () => {
  gridApi.value?.redrawRows();
};

const exportDataAsCsv = (params?: any): string => {
  return gridApi.value?.exportDataAsCsv(params) || '';
};

const exportDataAsPdf = (options?: any) => {
  gridApi.value?.exportDataAsPdf(options);
};

const downloadExcel = (options?: any) => {
  gridApi.value?.downloadExcel(options);
};

// 选择 API
const selectAll = () => gridApi.value?.selectAll();
const deselectAll = () => gridApi.value?.deselectAll();
const getSelectedRows = (): any[] => gridApi.value?.getSelectedRows() || [];
const getSelectedNodes = (): any[] => gridApi.value?.getSelectedNodes() || [];

// 排序 & 筛选 API
const setSort = (field: string, direction: 'asc' | 'desc' | null) => {
  gridApi.value?.setSort(field, direction);
};

const setQuickFilter = (text: string) => {
  gridApi.value?.setQuickFilter(text);
};

const clearQuickFilter = () => {
  gridApi.value?.clearQuickFilter();
};

// 分页 API
const setPageSize = (size: number) => {
  gridApi.value?.setPageSize(size);
};

const nextPage = () => gridApi.value?.nextPage();
const previousPage = () => gridApi.value?.previousPage();
const firstPage = () => gridApi.value?.firstPage();
const lastPage = () => gridApi.value?.lastPage();

// 行数据 API
const setRowData = (data: any[]) => {
  gridApi.value?.setRowData(data);
};

const getRowData = (): any[] => {
  return gridApi.value?.getRowData() || [];
};

// 列操作 API
const sizeColumnsToFit = () => {
  gridApi.value?.sizeColumnsToFit();
};

const resetColumnState = () => {
  gridApi.value?.resetColumnState();
};

// 撤销/重做 API
const undo = (): boolean => gridApi.value?.undo() || false;
const redo = (): boolean => gridApi.value?.redo() || false;
const canUndo = (): boolean => gridApi.value?.canUndo() || false;
const canRedo = (): boolean => gridApi.value?.canRedo() || false;

// 滚动 API
const ensureIndexVisible = (index: number, align?: string) => {
  gridApi.value?.ensureIndexVisible(index, align);
};

const ensureNodeVisible = (node: any, align?: string) => {
  gridApi.value?.ensureNodeVisible(node, align);
};

// Transaction API
const applyTransaction = (transaction: any) => {
  return gridApi.value?.applyTransaction(transaction);
};

// 状态持久化 API
const saveState = () => {
  return gridApi.value?.getState();
};

const restoreState = (state: any) => {
  gridApi.value?.setState(state);
};

// ============ Watchers ============
watch(() => props.rowData, (newVal) => {
  if (gridElement.value && newVal !== undefined) {
    gridElement.value.rowData = newVal;
  }
});

watch(() => props.columnDefs, (newVal) => {
  if (gridElement.value && newVal !== undefined) {
    gridElement.value.columnDefs = newVal;
  }
});

watch(() => props.pagination, (newVal) => {
  if (gridElement.value && newVal !== undefined) {
    gridElement.value.pagination = newVal;
  }
});

watch(() => props.quickFilterText, (newVal) => {
  if (gridElement.value && newVal !== undefined) {
    gridElement.value.quickFilterText = newVal;
  }
});

// ============ Expose ============
defineExpose({
  // 基本 API
  getApi,
  refresh,
  refreshCells,
  redrawRows,
  
  // 导出
  exportDataAsCsv,
  exportDataAsPdf,
  downloadExcel,
  
  // 选择
  selectAll,
  deselectAll,
  getSelectedRows,
  getSelectedNodes,
  
  // 排序 & 筛选
  setSort,
  setQuickFilter,
  clearQuickFilter,
  
  // 分页
  setPageSize,
  nextPage,
  previousPage,
  firstPage,
  lastPage,
  
  // 数据
  setRowData,
  getRowData,
  
  // 列操作
  sizeColumnsToFit,
  resetColumnState,
  
  // 撤销/重做
  undo,
  redo,
  canUndo,
  canRedo,
  
  // 滚动
  ensureIndexVisible,
  ensureNodeVisible,
  
  // Transaction
  applyTransaction,
  
  // 状态
  saveState,
  restoreState,
  
  // 状态标志
  isReady,
});
</script>

<style scoped>
.db-grid-vue-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.db-grid-vue-wrapper db-grid-element {
  flex: 1;
  min-height: 0;
}

.db-grid-vue-loading,
.db-grid-vue-no-rows {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
}
</style>
