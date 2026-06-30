// useDbGrid.ts
// Vue 3 Composable for db-grid

import { ref, shallowRef, computed, onMounted, onBeforeUnmount, type Ref, type ShallowRef } from 'vue';
import type { 
  ColDef, 
  GridApi, 
  GridReadyEvent,
  GridOptions,
  UseDbGridReturn,
  PaginationInfo,
} from './db-grid-vue.types';

// ============ Composable 配置 ============
export interface UseDbGridOptions {
  // 数据
  rowData?: any[];
  columnDefs?: ColDef[];
  
  // GridOptions
  gridOptions?: GridOptions;
  
  // 事件回调
  onGridReady?: (event: GridReadyEvent) => void;
  onSelectionChanged?: (selectedRows: any[], selectedNodes: any[]) => void;
  onCellClicked?: (event: any) => void;
  onSortChanged?: (event: any) => void;
  onFilterChanged?: (event: any) => void;
  onCellValueChanged?: (event: any) => void;
}

// ============ Composable 实现 ============
export function useDbGrid(options: UseDbGridOptions = {}): UseDbGridReturn {
  // ============ 状态 ============
  const gridApi = shallowRef<GridApi | null>(null);
  const gridRef = shallowRef<any>(null);
  const loading = ref(false);
  const data = ref<any[]>(options.rowData || []);
  const selectedRows = ref<any[]>([]);
  const selectedNodes = ref<any[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const paginationInfo = ref<PaginationInfo | null>(null);
  const isReady = ref(false);
  
  // ============ 内部方法 ============
  const updatePaginationInfo = () => {
    if (!gridApi.value) return;
    
    const info = gridApi.value.getPaginationInfo?.();
    if (info) {
      paginationInfo.value = info;
      currentPage.value = info.currentPage || 1;
      totalPages.value = info.totalPages || 0;
    }
  };
  
  // ============ 事件处理器 ============
  const handleGridReady = (event: GridReadyEvent) => {
    gridApi.value = event.api;
    isReady.value = true;
    updatePaginationInfo();
    options.onGridReady?.(event);
  };
  
  const handleSelectionChanged = (selectedRowsList: any[], selectedNodesList: any[]) => {
    selectedRows.value = selectedRowsList;
    selectedNodes.value = selectedNodesList;
    options.onSelectionChanged?.(selectedRowsList, selectedNodesList);
  };
  
  const handleCellClicked = (event: any) => {
    options.onCellClicked?.(event);
  };
  
  const handleSortChanged = (event: any) => {
    options.onSortChanged?.(event);
  };
  
  const handleFilterChanged = (event: any) => {
    updatePaginationInfo();
    options.onFilterChanged?.(event);
  };
  
  const handleCellValueChanged = (event: any) => {
    options.onCellValueChanged?.(event);
  };
  
  // ============ 操作方法 ============
  const setRowData = (newData: any[]) => {
    data.value = newData;
    if (gridApi.value) {
      gridApi.value.setRowData(newData);
    }
  };
  
  const setColumns = (columns: ColDef[]) => {
    if (gridApi.value) {
      // 通过 gridOptions 设置列定义
      gridApi.value.setGridOption('columnDefs', columns);
    }
  };
  
  const setLoading = (loadingState: boolean) => {
    loading.value = loadingState;
    if (gridApi.value) {
      if (loadingState) {
        gridApi.value.showLoadingOverlay?.('Loading...');
      } else {
        gridApi.value.hideOverlay?.();
      }
    }
  };
  
  const refresh = () => {
    gridApi.value?.refreshView();
  };
  
  const exportData = (format: 'csv' | 'excel' | 'pdf', params?: any) => {
    switch (format) {
      case 'csv':
        return gridApi.value?.exportDataAsCsv(params);
      case 'excel':
        return gridApi.value?.downloadExcel(params);
      case 'pdf':
        return gridApi.value?.exportDataAsPdf(params);
    }
  };
  
  const undo = (): boolean => gridApi.value?.undo() || false;
  const redo = (): boolean => gridApi.value?.redo() || false;
  
  // 选择方法
  const selectAll = () => gridApi.value?.selectAll();
  const deselectAll = () => gridApi.value?.deselectAll();
  const getSelectedRows = (): any[] => gridApi.value?.getSelectedRows() || selectedRows.value;
  
  // 排序 & 筛选
  const setSort = (field: string, direction: 'asc' | 'desc' | null) => {
    gridApi.value?.setSort(field, direction);
  };
  
  const setQuickFilter = (text: string) => {
    gridApi.value?.setQuickFilter(text);
  };
  
  // 分页
  const nextPage = () => {
    gridApi.value?.nextPage();
    updatePaginationInfo();
  };
  
  const previousPage = () => {
    gridApi.value?.previousPage();
    updatePaginationInfo();
  };
  
  const firstPage = () => {
    gridApi.value?.firstPage();
    updatePaginationInfo();
  };
  
  const lastPage = () => {
    gridApi.value?.lastPage();
    updatePaginationInfo();
  };
  
  const setPageSize = (size: number) => {
    gridApi.value?.setPageSize(size);
    updatePaginationInfo();
  };
  
  // ============ 返回 ============
  return {
    // 状态
    gridApi,
    gridRef,
    loading,
    data,
    selectedRows,
    selectedNodes,
    currentPage,
    totalPages,
    paginationInfo,
    isReady,
    
    // 操作方法
    setRowData,
    setColumns,
    setLoading,
    refresh,
    exportData,
    undo,
    redo,
    
    // 选择方法
    selectAll,
    deselectAll,
    getSelectedRows,
    
    // 排序 & 筛选
    setSort,
    setQuickFilter,
    
    // 分页
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
  };
}

// ============ 便利的 hooks ============

/**
 * 带分页的 db-grid composable
 */
export function usePagedDbGrid(options: UseDbGridOptions & { pageSize?: number } = {}) {
  const pageSize = options.pageSize || 10;
  
  const grid = useDbGrid({
    ...options,
    gridOptions: {
      ...options.gridOptions,
      pagination: true,
      paginationPageSize: pageSize,
    },
  });
  
  // 扩展分页功能
  const goToPage = (page: number) => {
    if (page < 1 || (grid.totalPages.value > 0 && page > grid.totalPages.value)) return;
    
    while (grid.currentPage.value < page) {
      grid.nextPage();
    }
    while (grid.currentPage.value > page) {
      grid.previousPage();
    }
  };
  
  return {
    ...grid,
    goToPage,
  };
}

/**
 * 带选择功能的 db-grid composable
 */
export function useSelectableDbGrid(options: UseDbGridOptions & { 
  selectionType?: 'single' | 'multiple' | 'checkbox' 
} = {}) {
  const selectionType = options.selectionType || 'multiple';
  
  const grid = useDbGrid({
    ...options,
    gridOptions: {
      ...options.gridOptions,
      rowSelection: selectionType,
    },
    onSelectionChanged: (rows, nodes) => {
      options.onSelectionChanged?.(rows, nodes);
    },
  });
  
  // 选择操作
  const toggleRowSelection = (rowIndex: number) => {
    const api = grid.gridApi.value;
    if (!api) return;
    
    // 获取行节点
    api.forEachNode?.((node: any) => {
      if (node.rowIndex === rowIndex) {
        if (node.isSelected()) {
          api.deselectNode(node);
        } else {
          api.selectNode(node, selectionType === 'single');
        }
      }
    });
  };
  
  const selectRowByIndex = (rowIndex: number) => {
    const api = grid.gridApi.value;
    if (!api) return;
    
    api.forEachNode?.((node: any) => {
      if (node.rowIndex === rowIndex) {
        api.selectNode(node, selectionType === 'single');
      }
    });
  };
  
  const selectAllRows = () => {
    grid.selectAll();
  };
  
  const clearSelection = () => {
    grid.deselectAll();
  };
  
  // 监听选择变化
  grid.gridApi.value?.addEventListener?.('selectionChanged', (event: any) => {
    grid.selectedRows.value = event.selectedRows || [];
    grid.selectedNodes.value = event.selectedNodes || [];
  });
  
  return {
    ...grid,
    toggleRowSelection,
    selectRowByIndex,
    selectAllRows,
    clearSelection,
  };
}

/**
 * 带编辑功能的 db-grid composable
 */
export function useEditableDbGrid(options: UseDbGridOptions = {}) {
  const grid = useDbGrid({
    ...options,
    gridOptions: {
      ...options.gridOptions,
      enableCellEdit: true,
      editOnDoubleClick: true,
    },
  });
  
  // 编辑操作
  const startEdit = (rowIndex: number, colId: string) => {
    grid.gridApi.value?.startCellEdit(rowIndex, colId);
  };
  
  const stopEdit = (cancel = false) => {
    grid.gridApi.value?.stopCellEdit(cancel);
  };
  
  const isEditing = (): boolean => {
    return grid.gridApi.value?.isCellEditing() || false;
  };
  
  const setCellValue = (rowIndex: number, colId: string, value: any) => {
    const api = grid.gridApi.value;
    if (!api) return;
    
    const rowData = [...grid.data.value];
    if (rowData[rowIndex]) {
      // 找到列定义
      const colDef = (options.columnDefs || []).find(c => (c.colId || c.field) === colId);
      if (colDef?.field) {
        rowData[rowIndex] = { ...rowData[rowIndex], [colDef.field]: value };
        grid.setRowData(rowData);
      }
    }
  };
  
  return {
    ...grid,
    startEdit,
    stopEdit,
    isEditing,
    setCellValue,
  };
}
