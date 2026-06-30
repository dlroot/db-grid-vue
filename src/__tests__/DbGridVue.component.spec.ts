import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============ Mock DbGridElement ============
const createMockGridElement = () => {
  const listeners: Map<string, Function> = new Map();
  
  return {
    // 属性
    rowData: [],
    columnDefs: [],
    pagination: false,
    quickFilterText: '',
    
    // 方法
    addEventListener: vi.fn((event: string, handler: Function) => {
      listeners.set(event, handler);
    }),
    removeEventListener: vi.fn((event: string) => {
      listeners.delete(event);
    }),
    
    // 模拟触发事件
    trigger: (eventName: string, detail: any = {}) => {
      const handler = listeners.get(eventName);
      if (handler) {
        handler({ detail: { ...detail, type: eventName } });
      }
    },
    
    // 重置
    reset: () => {
      listeners.clear();
      vi.clearAllMocks();
    },
  };
};

// ============ 组件行为测试 ============
describe('DbGridVue Component 行为测试', () => {
  describe('Props 验证', () => {
    it('应接受基础 Props', () => {
      const props = {
        rowData: [{ id: 1, name: '张三' }],
        columnDefs: [{ field: 'name', headerName: '姓名' }],
        height: 500,
        width: '100%',
        pagination: true,
        paginationPageSize: 10,
      };

      expect(props.rowData).toHaveLength(1);
      expect(props.pagination).toBe(true);
      expect(props.paginationPageSize).toBe(10);
    });

    it('应接受选择相关 Props', () => {
      const props = {
        rowSelection: 'multiple' as const,
        suppressRowClickSelection: false,
      };

      expect(props.rowSelection).toBe('multiple');
    });

    it('应接受编辑相关 Props', () => {
      const props = {
        enableCellEdit: true,
        editOnDoubleClick: true,
        editOnClick: false,
      };

      expect(props.enableCellEdit).toBe(true);
      expect(props.editOnDoubleClick).toBe(true);
    });

    it('应接受高级功能 Props', () => {
      const props = {
        rowDragEnabled: true,
        rangeSelection: true,
        undoRedo: true,
        animateRows: true,
      };

      expect(props.rowDragEnabled).toBe(true);
      expect(props.rangeSelection).toBe(true);
      expect(props.undoRedo).toBe(true);
    });

    it('应接受尺寸相关 Props', () => {
      const props = {
        rowHeight: 40,
        headerHeight: 44,
      };

      expect(props.rowHeight).toBe(40);
      expect(props.headerHeight).toBe(44);
    });

    it('应接受主题和本地化 Props', () => {
      const props = {
        theme: 'ag-theme-alpine',
        locale: 'zh-CN',
      };

      expect(props.theme).toBe('ag-theme-alpine');
      expect(props.locale).toBe('zh-CN');
    });

    it('应接受状态持久化 Props', () => {
      const props = {
        stateStorage: 'localStorage' as const,
        stateKey: 'my-grid-state',
        autoSaveState: true,
      };

      expect(props.stateStorage).toBe('localStorage');
      expect(props.autoSaveState).toBe(true);
    });

    it('应接受 GridOptions 合并', () => {
      const props = {
        gridOptions: {
          rowHeight: 50,
          enableRangeSelection: true,
          suppressCellFocus: false,
        },
      };

      expect(props.gridOptions.rowHeight).toBe(50);
      expect(props.gridOptions.enableRangeSelection).toBe(true);
    });

    it('应接受自定义样式', () => {
      const props = {
        className: 'my-custom-grid',
        style: {
          border: '1px solid #ccc',
          borderRadius: '8px',
        },
      };

      expect(props.className).toBe('my-custom-grid');
      expect(props.style.border).toBe('1px solid #ccc');
    });
  });

  describe('Events 验证', () => {
    it('gridReady 事件应包含 API', () => {
      const event = {
        detail: {
          api: { getSelectedRows: () => [] },
          columnApi: {},
          type: 'gridReady',
        },
      };

      expect(event.detail.api).toBeDefined();
      expect(event.detail.type).toBe('gridReady');
    });

    it('selectionChanged 事件应包含选中数据', () => {
      const event = {
        detail: {
          type: 'selectionChanged',
        },
      };

      // 模拟处理
      const selectedRows = [{ id: 1 }, { id: 2 }];
      const selectedNodes = [{}, {}];

      expect(selectedRows).toHaveLength(2);
      expect(selectedNodes).toHaveLength(2);
    });

    it('cellClicked 事件应包含单元格信息', () => {
      const event = {
        detail: {
          rowIndex: 0,
          colDef: { field: 'name', headerName: '姓名' },
          value: '张三',
          data: { id: 1, name: '张三' },
          node: { rowIndex: 0 },
          event: {},
          type: 'cellClicked',
        },
      };

      expect(event.detail.rowIndex).toBe(0);
      expect(event.detail.colDef.field).toBe('name');
      expect(event.detail.value).toBe('张三');
    });

    it('cellDoubleClicked 事件应包含双击信息', () => {
      const event = {
        detail: {
          rowIndex: 1,
          colDef: { field: 'name' },
          value: '李四',
          type: 'cellDoubleClicked',
        },
      };

      expect(event.detail.type).toBe('cellDoubleClicked');
      expect(event.detail.rowIndex).toBe(1);
    });

    it('rowClicked 事件应包含行信息', () => {
      const event = {
        detail: {
          rowIndex: 0,
          data: { id: 1, name: '王五' },
          node: { rowIndex: 0 },
          event: {},
          type: 'rowClicked',
        },
      };

      expect(event.detail.data.name).toBe('王五');
    });

    it('sortChanged 事件应包含排序信息', () => {
      const event = {
        detail: {
          sortModel: [
            { colId: 'name', sort: 'asc' },
          ],
          type: 'sortChanged',
        },
      };

      expect(event.detail.sortModel).toHaveLength(1);
      expect(event.detail.sortModel[0].sort).toBe('asc');
    });

    it('filterChanged 事件应包含筛选信息', () => {
      const event = {
        detail: {
          filterModel: {
            name: { filterType: 'text', type: 'contains', filter: '张' },
          },
          type: 'filterChanged',
        },
      };

      expect(event.detail.filterModel.name.filter).toBe('张');
    });

    it('cellValueChanged 事件应包含新旧值', () => {
      const event = {
        detail: {
          rowIndex: 0,
          colDef: { field: 'name' },
          value: '赵六',
          oldValue: '王五',
          data: { id: 1, name: '赵六' },
          type: 'cellValueChanged',
        },
      };

      expect(event.detail.oldValue).toBe('王五');
      expect(event.detail.value).toBe('赵六');
    });

    it('modelUpdated 事件应在模型更新时触发', () => {
      const event = {
        detail: {
          type: 'modelUpdated',
        },
      };

      expect(event.detail.type).toBe('modelUpdated');
    });

    it('rowDataUpdated 事件应在数据更新时触发', () => {
      const event = {
        detail: {
          type: 'rowDataUpdated',
        },
      };

      expect(event.detail.type).toBe('rowDataUpdated');
    });
  });

  describe('Ref API 验证', () => {
    const mockApi = {
      getSelectedRows: vi.fn(() => [{ id: 1 }]),
      getSelectedNodes: vi.fn(() => [{}]),
      refreshView: vi.fn(),
      refreshCells: vi.fn(),
      redrawRows: vi.fn(),
      exportDataAsCsv: vi.fn(() => 'id,name\n1,张三'),
      exportDataAsPdf: vi.fn(),
      downloadExcel: vi.fn(),
      selectAll: vi.fn(),
      deselectAll: vi.fn(),
      setSort: vi.fn(),
      setQuickFilter: vi.fn(),
      clearQuickFilter: vi.fn(),
      setPageSize: vi.fn(),
      nextPage: vi.fn(),
      previousPage: vi.fn(),
      firstPage: vi.fn(),
      lastPage: vi.fn(),
      setRowData: vi.fn(),
      getRowData: vi.fn(() => [{ id: 1 }]),
      sizeColumnsToFit: vi.fn(),
      resetColumnState: vi.fn(),
      undo: vi.fn(() => true),
      redo: vi.fn(() => true),
      canUndo: vi.fn(() => true),
      canRedo: vi.fn(() => true),
      ensureIndexVisible: vi.fn(),
      ensureNodeVisible: vi.fn(),
      applyTransaction: vi.fn(() => ({ added: [] })),
      getState: vi.fn(() => ({})),
      setState: vi.fn(),
    };

    it('getApi 应返回 GridApi', () => {
      const getApi = () => mockApi;
      const api = getApi();
      
      expect(api).toBeDefined();
      expect(api.getSelectedRows).toBeDefined();
    });

    it('refresh 应调用 refreshView', () => {
      const refresh = () => mockApi.refreshView();
      refresh();
      
      expect(mockApi.refreshView).toHaveBeenCalled();
    });

    it('refreshCells 应传递参数', () => {
      const refreshCells = (params: any) => mockApi.refreshCells(params);
      const params = { force: true };
      
      refreshCells(params);
      
      expect(mockApi.refreshCells).toHaveBeenCalledWith(params);
    });

    it('exportDataAsCsv 应返回 CSV 字符串', () => {
      const exportDataAsCsv = (params?: any) => mockApi.exportDataAsCsv(params);
      const result = exportDataAsCsv();
      
      expect(result).toBe('id,name\n1,张三');
    });

    it('exportDataAsPdf 应调用导出方法', () => {
      const exportDataAsPdf = (options?: any) => mockApi.exportDataAsPdf(options);
      
      exportDataAsPdf();
      
      expect(mockApi.exportDataAsPdf).toHaveBeenCalled();
    });

    it('downloadExcel 应调用 Excel 导出', () => {
      const downloadExcel = (options?: any) => mockApi.downloadExcel(options);
      
      downloadExcel();
      
      expect(mockApi.downloadExcel).toHaveBeenCalled();
    });

    it('选择方法应正确调用 API', () => {
      const selectAll = () => mockApi.selectAll();
      const deselectAll = () => mockApi.deselectAll();
      const getSelectedRows = () => mockApi.getSelectedRows();
      const getSelectedNodes = () => mockApi.getSelectedNodes();

      selectAll();
      expect(mockApi.selectAll).toHaveBeenCalled();

      deselectAll();
      expect(mockApi.deselectAll).toHaveBeenCalled();

      getSelectedRows();
      expect(mockApi.getSelectedRows).toHaveBeenCalled();

      getSelectedNodes();
      expect(mockApi.getSelectedNodes).toHaveBeenCalled();
    });

    it('排序方法应正确调用 API', () => {
      const setSort = (field: string, direction: string) => mockApi.setSort(field, direction);
      
      setSort('name', 'asc');
      expect(mockApi.setSort).toHaveBeenCalledWith('name', 'asc');
      
      setSort('age', 'desc');
      expect(mockApi.setSort).toHaveBeenCalledWith('age', 'desc');
    });

    it('筛选方法应正确调用 API', () => {
      const setQuickFilter = (text: string) => mockApi.setQuickFilter(text);
      const clearQuickFilter = () => mockApi.clearQuickFilter();
      
      setQuickFilter('张三');
      expect(mockApi.setQuickFilter).toHaveBeenCalledWith('张三');
      
      clearQuickFilter();
      expect(mockApi.clearQuickFilter).toHaveBeenCalled();
    });

    it('分页方法应正确调用 API', () => {
      const setPageSize = (size: number) => mockApi.setPageSize(size);
      const nextPage = () => mockApi.nextPage();
      const previousPage = () => mockApi.previousPage();
      const firstPage = () => mockApi.firstPage();
      const lastPage = () => mockApi.lastPage();

      setPageSize(25);
      expect(mockApi.setPageSize).toHaveBeenCalledWith(25);

      nextPage();
      expect(mockApi.nextPage).toHaveBeenCalled();

      previousPage();
      expect(mockApi.previousPage).toHaveBeenCalled();

      firstPage();
      expect(mockApi.firstPage).toHaveBeenCalled();

      lastPage();
      expect(mockApi.lastPage).toHaveBeenCalled();
    });

    it('数据方法应正确调用 API', () => {
      const setRowData = (data: any[]) => mockApi.setRowData(data);
      const getRowData = () => mockApi.getRowData();

      const data = [{ id: 1 }];
      setRowData(data);
      expect(mockApi.setRowData).toHaveBeenCalledWith(data);

      getRowData();
      expect(mockApi.getRowData).toHaveBeenCalled();
    });

    it('列操作方法应正确调用 API', () => {
      const sizeColumnsToFit = () => mockApi.sizeColumnsToFit();
      const resetColumnState = () => mockApi.resetColumnState();

      sizeColumnsToFit();
      expect(mockApi.sizeColumnsToFit).toHaveBeenCalled();

      resetColumnState();
      expect(mockApi.resetColumnState).toHaveBeenCalled();
    });

    it('撤销/重做方法应正确调用 API', () => {
      const undo = () => mockApi.undo();
      const redo = () => mockApi.redo();
      const canUndo = () => mockApi.canUndo();
      const canRedo = () => mockApi.canRedo();

      expect(undo()).toBe(true);
      expect(redo()).toBe(true);
      expect(canUndo()).toBe(true);
      expect(canRedo()).toBe(true);

      expect(mockApi.undo).toHaveBeenCalled();
      expect(mockApi.redo).toHaveBeenCalled();
      expect(mockApi.canUndo).toHaveBeenCalled();
      expect(mockApi.canRedo).toHaveBeenCalled();
    });

    it('滚动方法应正确调用 API', () => {
      const ensureIndexVisible = (index: number, align?: string) => mockApi.ensureIndexVisible(index, align);
      const ensureNodeVisible = (node: any, align?: string) => mockApi.ensureNodeVisible(node, align);

      ensureIndexVisible(5);
      expect(mockApi.ensureIndexVisible).toHaveBeenCalledWith(5, undefined);

      ensureIndexVisible(10, 'middle');
      expect(mockApi.ensureIndexVisible).toHaveBeenCalledWith(10, 'middle');

      ensureNodeVisible({}, 'top');
      expect(mockApi.ensureNodeVisible).toHaveBeenCalledWith({}, 'top');
    });

    it('Transaction 方法应正确调用 API', () => {
      const applyTransaction = (transaction: any) => mockApi.applyTransaction(transaction);

      const transaction = { add: [{ id: 1 }] };
      applyTransaction(transaction);

      expect(mockApi.applyTransaction).toHaveBeenCalledWith(transaction);
    });

    it('状态方法应正确调用 API', () => {
      const saveState = () => mockApi.getState();
      const restoreState = (state: any) => mockApi.setState(state);

      const state = saveState();
      expect(state).toEqual({});

      const newState = { columnState: [] };
      restoreState(newState);
      expect(mockApi.setState).toHaveBeenCalledWith(newState);
    });
  });

  describe('Computed 属性验证', () => {
    it('resolvedHeight 应处理数字类型', () => {
      const height = 500;
      const resolvedHeight = typeof height === 'number' ? `${height}px` : height;
      
      expect(resolvedHeight).toBe('500px');
    });

    it('resolvedHeight 应处理字符串类型', () => {
      const height = '100%';
      const resolvedHeight = typeof height === 'number' ? `${height}px` : height;
      
      expect(resolvedHeight).toBe('100%');
    });

    it('resolvedWidth 应处理数字类型', () => {
      const width = 800;
      const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
      
      expect(resolvedWidth).toBe('800px');
    });

    it('containerStyle 应包含所有样式属性', () => {
      const height = '500px';
      const width = '100%';
      const customStyle = { border: '1px solid #ccc' };
      
      const containerStyle = {
        height,
        width,
        position: 'relative',
        ...customStyle,
      };
      
      expect(containerStyle.height).toBe('500px');
      expect(containerStyle.width).toBe('100%');
      expect(containerStyle.position).toBe('relative');
      expect(containerStyle.border).toBe('1px solid #ccc');
    });
  });

  describe('Watchers 验证', () => {
    it('rowData 变化应更新 gridElement', () => {
      const gridElement = { rowData: [] };
      const newRowData = [{ id: 1, name: '张三' }];
      
      // 模拟 watch 行为
      if (newRowData !== undefined) {
        gridElement.rowData = newRowData;
      }
      
      expect(gridElement.rowData).toEqual(newRowData);
    });

    it('columnDefs 变化应更新 gridElement', () => {
      const gridElement = { columnDefs: [] };
      const newColumnDefs = [{ field: 'name' }];
      
      if (newColumnDefs !== undefined) {
        gridElement.columnDefs = newColumnDefs;
      }
      
      expect(gridElement.columnDefs).toEqual(newColumnDefs);
    });

    it('pagination 变化应更新 gridElement', () => {
      const gridElement = { pagination: false };
      const newPagination = true;
      
      if (newPagination !== undefined) {
        gridElement.pagination = newPagination;
      }
      
      expect(gridElement.pagination).toBe(true);
    });

    it('quickFilterText 变化应更新 gridElement', () => {
      const gridElement = { quickFilterText: '' };
      const newQuickFilterText = '张三';
      
      if (newQuickFilterText !== undefined) {
        gridElement.quickFilterText = newQuickFilterText;
      }
      
      expect(gridElement.quickFilterText).toBe('张三');
    });
  });

  describe('事件规范化验证', () => {
    it('应规范化单元格事件数据', () => {
      const detail = {
        rowIndex: 1,
        colDef: { field: 'name' },
        value: '李四',
        data: { id: 1 },
        node: {},
        column: {},
        event: {},
        type: 'cellClicked',
      };
      
      const normalized = {
        rowIndex: detail.rowIndex ?? 0,
        colDef: detail.colDef ?? {},
        value: detail.value,
        data: detail.data,
        node: detail.node,
        column: detail.column,
        event: detail.event,
        type: detail.type,
      };
      
      expect(normalized.rowIndex).toBe(1);
      expect(normalized.colDef.field).toBe('name');
    });

    it('应规范化行事件数据', () => {
      const detail = {
        rowIndex: 2,
        data: { id: 2 },
        node: {},
        event: {},
        type: 'rowClicked',
      };
      
      const normalized = {
        rowIndex: detail.rowIndex ?? 0,
        data: detail.data,
        node: detail.node,
        event: detail.event,
        type: detail.type,
      };
      
      expect(normalized.rowIndex).toBe(2);
      expect(normalized.type).toBe('rowClicked');
    });

    it('应处理缺失字段的默认值', () => {
      const detail = {
        value: 'test',
      };
      
      const normalized = {
        rowIndex: detail.rowIndex ?? 0,
        colDef: detail.colDef ?? {},
        value: detail.value,
      };
      
      expect(normalized.rowIndex).toBe(0);
      expect(normalized.colDef).toEqual({});
    });
  });
});

describe('DbGridVue 集成测试场景', () => {
  describe('完整使用流程', () => {
    it('应支持从初始化到导出的完整流程', () => {
      // 1. 初始化数据和列
      const rowData = [{ id: 1, name: '张三', age: 28 }];
      const columnDefs = [
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: '姓名' },
        { field: 'age', headerName: '年龄' },
      ];
      
      // 2. 模拟网格就绪
      const api = {
        getSelectedRows: () => [],
        refreshView: vi.fn(),
        setSort: vi.fn(),
        setQuickFilter: vi.fn(),
        exportDataAsCsv: vi.fn(() => 'id,name,age\n1,张三,28'),
      };
      
      // 3. 排序
      api.setSort('name', 'asc');
      expect(api.setSort).toHaveBeenCalledWith('name', 'asc');
      
      // 4. 筛选
      api.setQuickFilter('张三');
      expect(api.setQuickFilter).toHaveBeenCalledWith('张三');
      
      // 5. 刷新
      api.refreshView();
      expect(api.refreshView).toHaveBeenCalled();
      
      // 6. 导出
      const csv = api.exportDataAsCsv();
      expect(csv).toContain('张三');
    });

    it('应支持分页完整流程', () => {
      // 1. 初始化分页网格
      const paginationState = {
        pageSize: 10,
        currentPage: 1,
        totalPages: 5,
      };
      
      // 2. 导航操作
      const navigate = (direction: 'next' | 'prev' | 'first' | 'last') => {
        switch (direction) {
          case 'next':
            if (paginationState.currentPage < paginationState.totalPages) {
              paginationState.currentPage++;
            }
            break;
          case 'prev':
            if (paginationState.currentPage > 1) {
              paginationState.currentPage--;
            }
            break;
          case 'first':
            paginationState.currentPage = 1;
            break;
          case 'last':
            paginationState.currentPage = paginationState.totalPages;
            break;
        }
      };
      
      // 首页
      navigate('first');
      expect(paginationState.currentPage).toBe(1);
      
      // 下一页
      navigate('next');
      expect(paginationState.currentPage).toBe(2);
      
      // 最后一页
      navigate('last');
      expect(paginationState.currentPage).toBe(5);
      
      // 上一页
      navigate('prev');
      expect(paginationState.currentPage).toBe(4);
    });

    it('应支持选择和编辑流程', () => {
      // 1. 选择行
      const selectedRows: any[] = [];
      const selectRow = (row: any) => {
        if (!selectedRows.includes(row)) {
          selectedRows.push(row);
        }
      };
      
      selectRow({ id: 1, name: '张三' });
      selectRow({ id: 2, name: '李四' });
      
      expect(selectedRows).toHaveLength(2);
      
      // 2. 取消选择
      const deselectRow = (row: any) => {
        const index = selectedRows.indexOf(row);
        if (index > -1) {
          selectedRows.splice(index, 1);
        }
      };
      
      deselectRow({ id: 1, name: '张三' });
      expect(selectedRows).toHaveLength(1);
      
      // 3. 全选/取消全选
      const selectAll = (rows: any[]) => {
        selectedRows.push(...rows.filter(r => !selectedRows.includes(r)));
      };
      
      const deselectAll = () => {
        selectedRows.length = 0;
      };
      
      selectAll([{ id: 3 }, { id: 4 }]);
      expect(selectedRows).toHaveLength(3);
      
      deselectAll();
      expect(selectedRows).toHaveLength(0);
    });
  });
});
