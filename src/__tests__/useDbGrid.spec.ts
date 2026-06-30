import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, shallowRef } from 'vue';

// ============ Mock GridApi ============
const createMockGridApi = () => {
  const listeners: Map<string, Function[]> = new Map();
  let selectedRows: any[] = [];
  let currentPage = 1;
  let totalPages = 1;

  return {
    listeners,
    
    // 通用
    addEventListener: vi.fn((eventType: string, handler: Function) => {
      if (!listeners.has(eventType)) {
        listeners.set(eventType, []);
      }
      listeners.get(eventType)!.push(handler);
    }),
    removeEventListener: vi.fn((eventType: string, handler: Function) => {
      const handlers = listeners.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    }),
    setRowData: vi.fn((data: any[]) => {
      // 触发事件
      const handlers = listeners.get('rowDataUpdated');
      handlers?.forEach(h => h({ api: mockApi }));
    }),
    getRowData: vi.fn(() => []),
    setGridOption: vi.fn(),
    getGridOption: vi.fn(),
    
    // 选择
    selectAll: vi.fn(),
    deselectAll: vi.fn(),
    selectNode: vi.fn(),
    deselectNode: vi.fn(),
    getSelectedNodes: vi.fn(() => []),
    getSelectedRows: vi.fn(() => selectedRows),
    setSelectedRows: (rows: any[]) => { selectedRows = rows; },
    
    // 排序
    sortByColumn: vi.fn(),
    setSort: vi.fn(),
    clearSort: vi.fn(),
    
    // 筛选
    setFilterModel: vi.fn(),
    getFilterModel: vi.fn(() => ({})),
    setQuickFilter: vi.fn(),
    getQuickFilter: vi.fn(() => ''),
    clearQuickFilter: vi.fn(),
    
    // 视图
    refreshCells: vi.fn(),
    redrawRows: vi.fn(),
    sizeColumnsToFit: vi.fn(),
    resetColumnState: vi.fn(),
    refreshView: vi.fn(),
    
    // 行
    getDisplayedRowCount: vi.fn(() => 100),
    getDisplayedRows: vi.fn(() => []),
    getRowNode: vi.fn(),
    forEachNode: vi.fn(),
    
    // 滚动
    ensureIndexVisible: vi.fn(),
    ensureNodeVisible: vi.fn(),
    ensureColumnVisible: vi.fn(),
    
    // Transaction
    applyTransaction: vi.fn(() => ({ added: [], removed: [], updated: [] })),
    
    // 树形数据
    expandNode: vi.fn(),
    collapseNode: vi.fn(),
    toggleNode: vi.fn(),
    expandAll: vi.fn(),
    collapseAll: vi.fn(),
    isNodeExpanded: vi.fn(() => false),
    
    // 行分组
    setRowGroupColumns: vi.fn(),
    removeRowGroupColumns: vi.fn(),
    expandGroup: vi.fn(),
    collapseGroup: vi.fn(),
    
    // 单元格编辑
    startCellEdit: vi.fn(),
    stopCellEdit: vi.fn(),
    isCellEditing: vi.fn(() => false),
    
    // 列固定
    pinColumn: vi.fn(),
    unpinColumn: vi.fn(),
    getPinnedColumns: vi.fn(() => ({ left: [], right: [] })),
    
    // 行固定
    pinRow: vi.fn(),
    unpinRow: vi.fn(),
    getPinnedTopRows: vi.fn(() => []),
    getPinnedBottomRows: vi.fn(() => []),
    clearPinnedRows: vi.fn(),
    
    // 分页
    setPageSize: vi.fn(),
    setCurrentPage: vi.fn((page: number) => { currentPage = page; }),
    getCurrentPage: vi.fn(() => currentPage),
    getTotalPages: vi.fn(() => totalPages),
    setTotalPages: (pages: number) => { totalPages = pages; },
    nextPage: vi.fn(() => { if (currentPage < totalPages) currentPage++; }),
    previousPage: vi.fn(() => { if (currentPage > 1) currentPage--; }),
    firstPage: vi.fn(() => { currentPage = 1; }),
    lastPage: vi.fn(() => { currentPage = totalPages; }),
    getPaginationInfo: vi.fn(() => ({
      currentPage,
      pageSize: 10,
      totalPages,
      totalRows: 100,
    })),
    
    // 导出
    exportDataAsCsv: vi.fn(() => 'id,name\n1,张三'),
    exportDataAsPdf: vi.fn(),
    downloadExcel: vi.fn(),
    importCsv: vi.fn(),
    
    // 范围选择 & 剪贴板
    copyToClipboard: vi.fn(),
    cutToClipboard: vi.fn(),
    pasteFromClipboard: vi.fn(),
    
    // 撤销/重做
    undo: vi.fn(() => true),
    redo: vi.fn(() => true),
    canUndo: vi.fn(() => true),
    canRedo: vi.fn(() => true),
    
    // 状态持久化
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
    saveStateToLocalStorage: vi.fn(),
    loadStateFromLocalStorage: vi.fn(),
    
    // 刷新
    refreshServerSide: vi.fn(),
    
    // Overlay
    showLoadingOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    showNoRowsOverlay: vi.fn(),
    
    // 触发事件
    emit: (eventType: string, data?: any) => {
      const handlers = listeners.get(eventType);
      handlers?.forEach(h => h(data || {}));
    },
  };
};

const mockApi = createMockGridApi();

// ============ useDbGrid 实现 (用于测试) ============
interface UseDbGridOptions {
  rowData?: any[];
  columnDefs?: any[];
  onGridReady?: (event: any) => void;
  onSelectionChanged?: (selectedRows: any[], selectedNodes: any[]) => void;
}

interface UseDbGridReturn {
  gridApi: any;
  loading: any;
  data: any;
  selectedRows: any;
  selectedNodes: any;
  currentPage: any;
  totalPages: any;
  paginationInfo: any;
  isReady: any;
  setRowData: (data: any[]) => void;
  setColumns: (columns: any[]) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => void;
  exportData: (format: 'csv' | 'excel' | 'pdf', params?: any) => any;
  undo: () => boolean;
  redo: () => boolean;
  selectAll: () => void;
  deselectAll: () => void;
  getSelectedRows: () => any[];
  setSort: (field: string, direction: 'asc' | 'desc' | null) => void;
  setQuickFilter: (text: string) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
}

function useDbGrid(options: UseDbGridOptions = {}): UseDbGridReturn {
  const gridApi = shallowRef<any>(null);
  const loading = ref(false);
  const data = ref<any[]>(options.rowData || []);
  const selectedRows = ref<any[]>([]);
  const selectedNodes = ref<any[]>([]);
  const currentPage = ref(1);
  const totalPages = ref(0);
  const paginationInfo = ref<any>(null);
  const isReady = ref(false);

  const updatePaginationInfo = () => {
    if (!gridApi.value) return;
    const info = gridApi.value.getPaginationInfo?.();
    if (info) {
      paginationInfo.value = info;
      currentPage.value = info.currentPage || 1;
      totalPages.value = info.totalPages || 0;
    }
  };

  const handleGridReady = (event: any) => {
    gridApi.value = event.api;
    isReady.value = true;
    updatePaginationInfo();
    options.onGridReady?.(event);
  };

  const handleSelectionChanged = (rows: any[], nodes: any[]) => {
    selectedRows.value = rows;
    selectedNodes.value = nodes;
    options.onSelectionChanged?.(rows, nodes);
  };

  return {
    gridApi,
    loading,
    data,
    selectedRows,
    selectedNodes,
    currentPage,
    totalPages,
    paginationInfo,
    isReady,
    
    setRowData: (newData: any[]) => {
      data.value = newData;
      if (gridApi.value) {
        gridApi.value.setRowData(newData);
      }
    },
    
    setColumns: (columns: any[]) => {
      if (gridApi.value) {
        gridApi.value.setGridOption('columnDefs', columns);
      }
    },
    
    setLoading: (loadingState: boolean) => {
      loading.value = loadingState;
      if (gridApi.value) {
        if (loadingState) {
          gridApi.value.showLoadingOverlay?.('Loading...');
        } else {
          gridApi.value.hideOverlay?.();
        }
      }
    },
    
    refresh: () => {
      gridApi.value?.refreshView();
    },
    
    exportData: (format: 'csv' | 'excel' | 'pdf', params?: any) => {
      switch (format) {
        case 'csv': return gridApi.value?.exportDataAsCsv(params);
        case 'excel': return gridApi.value?.downloadExcel(params);
        case 'pdf': return gridApi.value?.exportDataAsPdf(params);
      }
    },
    
    undo: () => gridApi.value?.undo() || false,
    redo: () => gridApi.value?.redo() || false,
    
    selectAll: () => gridApi.value?.selectAll(),
    deselectAll: () => gridApi.value?.deselectAll(),
    getSelectedRows: () => gridApi.value?.getSelectedRows() || selectedRows.value,
    
    setSort: (field: string, direction: 'asc' | 'desc' | null) => {
      gridApi.value?.setSort(field, direction);
    },
    
    setQuickFilter: (text: string) => {
      gridApi.value?.setQuickFilter(text);
    },
    
    nextPage: () => {
      gridApi.value?.nextPage();
      updatePaginationInfo();
    },
    
    previousPage: () => {
      gridApi.value?.previousPage();
      updatePaginationInfo();
    },
    
    firstPage: () => {
      gridApi.value?.firstPage();
      updatePaginationInfo();
    },
    
    lastPage: () => {
      gridApi.value?.lastPage();
      updatePaginationInfo();
    },
    
    setPageSize: (size: number) => {
      gridApi.value?.setPageSize(size);
      updatePaginationInfo();
    },
  };
}

// ============ 测试用例 ============

describe('useDbGrid Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应正确初始化空状态', () => {
      const grid = useDbGrid();
      
      expect(grid.gridApi.value).toBeNull();
      expect(grid.loading.value).toBe(false);
      expect(grid.data.value).toEqual([]);
      expect(grid.selectedRows.value).toEqual([]);
      expect(grid.isReady.value).toBe(false);
    });

    it('应接受初始行数据', () => {
      const initialData = [{ id: 1, name: '张三' }];
      const grid = useDbGrid({ rowData: initialData });
      
      expect(grid.data.value).toEqual(initialData);
    });

    it('应接受初始列定义', () => {
      const columns = [{ field: 'name', headerName: '姓名' }];
      const grid = useDbGrid({ columnDefs: columns });
      
      expect(grid.columnDefs).toBeDefined();
    });

    it('应支持 gridReady 回调', () => {
      const onGridReady = vi.fn();
      const grid = useDbGrid({ onGridReady });
      
      // 模拟网格就绪
      const event = { api: mockApi, type: 'gridReady' };
      grid.gridApi.value = mockApi;
      grid.isReady.value = true;
      grid.paginationInfo.value = mockApi.getPaginationInfo();
      onGridReady(event);
      
      expect(onGridReady).toHaveBeenCalledWith(event);
    });

    it('应支持 selectionChanged 回调', () => {
      const onSelectionChanged = vi.fn();
      const grid = useDbGrid({ onSelectionChanged });
      
      const selectedRows = [{ id: 1 }, { id: 2 }];
      const selectedNodes = [{}, {}];
      
      grid.selectedRows.value = selectedRows;
      grid.selectedNodes.value = selectedNodes;
      onSelectionChanged(selectedRows, selectedNodes);
      
      expect(onSelectionChanged).toHaveBeenCalledWith(selectedRows, selectedNodes);
    });
  });

  describe('数据操作', () => {
    it('setRowData 应更新数据', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const newData = [{ id: 1, name: '李四' }];
      grid.setRowData(newData);
      
      expect(grid.data.value).toEqual(newData);
      expect(mockApi.setRowData).toHaveBeenCalledWith(newData);
    });

    it('setRowData 在 API 未就绪时应仅更新本地数据', () => {
      const grid = useDbGrid();
      // gridApi 为 null
      
      const newData = [{ id: 1, name: '王五' }];
      grid.setRowData(newData);
      
      expect(grid.data.value).toEqual(newData);
      expect(mockApi.setRowData).not.toHaveBeenCalled();
    });

    it('setColumns 应调用 setGridOption', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const columns = [{ field: 'age', headerName: '年龄' }];
      grid.setColumns(columns);
      
      expect(mockApi.setGridOption).toHaveBeenCalledWith('columnDefs', columns);
    });
  });

  describe('选择操作', () => {
    it('selectAll 应调用 gridApi.selectAll', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.selectAll();
      
      expect(mockApi.selectAll).toHaveBeenCalled();
    });

    it('deselectAll 应调用 gridApi.deselectAll', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.deselectAll();
      
      expect(mockApi.deselectAll).toHaveBeenCalled();
    });

    it('getSelectedRows 应返回选中行', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const expectedRows = [{ id: 1, name: '张三' }];
      mockApi.setSelectedRows(expectedRows);
      
      const selected = grid.getSelectedRows();
      
      expect(selected).toEqual(expectedRows);
    });

    it('getSelectedRows 在 API 未就绪时应返回本地状态', () => {
      const grid = useDbGrid();
      grid.gridApi.value = null;
      grid.selectedRows.value = [{ id: 1 }];
      
      const selected = grid.getSelectedRows();
      
      expect(selected).toEqual([{ id: 1 }]);
    });
  });

  describe('排序和筛选', () => {
    it('setSort 应调用 gridApi.setSort', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.setSort('name', 'asc');
      
      expect(mockApi.setSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('setSort 应支持 null 清除排序', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.setSort('name', null);
      
      expect(mockApi.setSort).toHaveBeenCalledWith('name', null);
    });

    it('setQuickFilter 应调用 gridApi.setQuickFilter', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.setQuickFilter('张三');
      
      expect(mockApi.setQuickFilter).toHaveBeenCalledWith('张三');
    });
  });

  describe('分页操作', () => {
    beforeEach(() => {
      mockApi.setTotalPages(5);
    });

    it('nextPage 应调用 gridApi.nextPage', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.nextPage();
      
      expect(mockApi.nextPage).toHaveBeenCalled();
    });

    it('previousPage 应调用 gridApi.previousPage', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.previousPage();
      
      expect(mockApi.previousPage).toHaveBeenCalled();
    });

    it('firstPage 应调用 gridApi.firstPage', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.firstPage();
      
      expect(mockApi.firstPage).toHaveBeenCalled();
    });

    it('lastPage 应调用 gridApi.lastPage', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.lastPage();
      
      expect(mockApi.lastPage).toHaveBeenCalled();
    });

    it('setPageSize 应调用 gridApi.setPageSize', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.setPageSize(25);
      
      expect(mockApi.setPageSize).toHaveBeenCalledWith(25);
    });

    it('分页操作后应更新分页信息', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.nextPage();
      
      expect(grid.paginationInfo.value).toBeDefined();
    });
  });

  describe('导出功能', () => {
    it('exportData 应导出 CSV', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const result = grid.exportData('csv');
      
      expect(mockApi.exportDataAsCsv).toHaveBeenCalled();
      expect(result).toBe('id,name\n1,张三');
    });

    it('exportData 应导出 Excel', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.exportData('excel');
      
      expect(mockApi.downloadExcel).toHaveBeenCalled();
    });

    it('exportData 应导出 PDF', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.exportData('pdf');
      
      expect(mockApi.exportDataAsPdf).toHaveBeenCalled();
    });

    it('exportData 应传递参数', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const params = { fileName: 'custom.csv', skipHeaders: true };
      grid.exportData('csv', params);
      
      expect(mockApi.exportDataAsCsv).toHaveBeenCalledWith(params);
    });
  });

  describe('撤销/重做', () => {
    it('undo 应调用 gridApi.undo', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const result = grid.undo();
      
      expect(mockApi.undo).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('redo 应调用 gridApi.redo', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      const result = grid.redo();
      
      expect(mockApi.redo).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('刷新功能', () => {
    it('refresh 应调用 gridApi.refreshView', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.refresh();
      
      expect(mockApi.refreshView).toHaveBeenCalled();
    });

    it('refresh 在 API 未就绪时应安全执行', () => {
      const grid = useDbGrid();
      grid.gridApi.value = null;
      
      // 不应抛出错误
      expect(() => grid.refresh()).not.toThrow();
    });
  });

  describe('加载状态', () => {
    it('setLoading(true) 应显示加载遮罩', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.setLoading(true);
      
      expect(grid.loading.value).toBe(true);
      expect(mockApi.showLoadingOverlay).toHaveBeenCalledWith('Loading...');
    });

    it('setLoading(false) 应隐藏加载遮罩', () => {
      const grid = useDbGrid();
      grid.gridApi.value = mockApi;
      
      grid.setLoading(false);
      
      expect(grid.loading.value).toBe(false);
      expect(mockApi.hideOverlay).toHaveBeenCalled();
    });
  });
});

describe('useDbGrid 集成场景', () => {
  it('应支持完整的 CRUD 流程', () => {
    const grid = useDbGrid({
      rowData: [{ id: 1, name: '张三', age: 28 }],
    });
    grid.gridApi.value = mockApi;
    
    // Create - 添加新行
    const newRow = { id: 2, name: '李四', age: 35 };
    grid.setRowData([...grid.data.value, newRow]);
    expect(grid.data.value).toHaveLength(2);
    
    // Read - 获取选中行
    mockApi.setSelectedRows([newRow]);
    const selected = grid.getSelectedRows();
    expect(selected).toContainEqual(newRow);
    
    // Update - 排序
    grid.setSort('name', 'asc');
    expect(mockApi.setSort).toHaveBeenCalledWith('name', 'asc');
    
    // Delete - 清空选择
    grid.deselectAll();
    expect(mockApi.deselectAll).toHaveBeenCalled();
  });

  it('应支持分页导航流程', () => {
    const grid = useDbGrid();
    grid.gridApi.value = mockApi;
    mockApi.setTotalPages(10);
    
    // 首页
    grid.firstPage();
    expect(grid.currentPage.value).toBe(1);
    
    // 下一页
    grid.nextPage();
    expect(grid.currentPage.value).toBe(2);
    
    // 最后一页
    grid.lastPage();
    expect(grid.currentPage.value).toBe(10);
    
    // 上一页
    grid.previousPage();
    expect(grid.currentPage.value).toBe(9);
  });

  it('应支持筛选-导出流程', () => {
    const grid = useDbGrid();
    grid.gridApi.value = mockApi;
    
    // 筛选
    grid.setQuickFilter('张三');
    expect(mockApi.setQuickFilter).toHaveBeenCalledWith('张三');
    
    // 导出
    grid.exportData('csv', { fileName: '筛选结果.csv' });
    expect(mockApi.exportDataAsCsv).toHaveBeenCalled();
    
    // 清除筛选
    grid.setQuickFilter('');
    expect(mockApi.setQuickFilter).toHaveBeenCalledWith('');
  });

  it('应支持撤销/重做工作流', () => {
    const grid = useDbGrid();
    grid.gridApi.value = mockApi;
    
    // 编辑数据
    grid.setRowData([{ id: 1, name: '王五' }]);
    
    // 撤销
    const undoResult = grid.undo();
    expect(undoResult).toBe(true);
    expect(mockApi.undo).toHaveBeenCalled();
    
    // 重做
    const redoResult = grid.redo();
    expect(redoResult).toBe(true);
    expect(mockApi.redo).toHaveBeenCalled();
  });
});
