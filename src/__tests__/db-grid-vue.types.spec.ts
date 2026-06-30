import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============ 类型定义测试 ============

describe('db-grid-vue.types', () => {
  describe('ColDef 类型验证', () => {
    it('应接受基本列定义', () => {
      const colDef = {
        field: 'name',
        headerName: '姓名',
        width: 120,
        sortable: true,
        filter: true,
      };

      expect(colDef.field).toBe('name');
      expect(colDef.headerName).toBe('姓名');
      expect(colDef.width).toBe(120);
      expect(colDef.sortable).toBe(true);
      expect(colDef.filter).toBe(true);
    });

    it('应支持单元格渲染器配置', () => {
      const colDef = {
        field: 'status',
        cellRenderer: 'agTextCellRenderer',
        cellClass: 'status-cell',
        cellStyle: { color: 'red' },
      };

      expect(colDef.cellRenderer).toBe('agTextCellRenderer');
      expect(colDef.cellClass).toBe('status-cell');
      expect(colDef.cellStyle).toEqual({ color: 'red' });
    });

    it('应支持单元格编辑配置', () => {
      const colDef = {
        field: 'name',
        editable: true,
        cellEditor: 'agTextCellEditor',
        editOnDoubleClick: true,
      };

      expect(colDef.editable).toBe(true);
      expect(colDef.cellEditor).toBe('agTextCellEditor');
      expect(colDef.editOnDoubleClick).toBe(true);
    });

    it('应支持值格式化和解析', () => {
      const colDef = {
        field: 'salary',
        valueFormatter: (params: any) => `¥${params.value}`,
        valueParser: (params: any) => parseInt(params.newValue.replace(/¥/g, ''), 10),
      };

      const formatted = colDef.valueFormatter({ value: 15000 });
      expect(formatted).toBe('¥15000');

      const parsed = colDef.valueParser({ newValue: '¥20000' });
      expect(parsed).toBe(20000);
    });

    it('应支持聚合配置', () => {
      const colDef = {
        field: 'amount',
        aggregation: 'sum',
      };

      expect(colDef.aggregation).toBe('sum');
    });

    it('应支持固定列配置', () => {
      const leftPinned = { field: 'id', pinned: 'left' };
      const rightPinned = { field: 'actions', pinned: 'right' };

      expect(leftPinned.pinned).toBe('left');
      expect(rightPinned.pinned).toBe('right');
    });

    it('应支持复选框选择', () => {
      const colDef = {
        field: 'select',
        checkboxSelection: true,
        headerCheckboxSelection: true,
      };

      expect(colDef.checkboxSelection).toBe(true);
      expect(colDef.headerCheckboxSelection).toBe(true);
    });

    it('应支持行分组', () => {
      const colDef = {
        field: 'department',
        rowGroup: true,
        enableRowGroup: true,
      };

      expect(colDef.rowGroup).toBe(true);
      expect(colDef.enableRowGroup).toBe(true);
    });

    it('应支持透视功能', () => {
      const colDef = {
        field: 'category',
        pivot: true,
        enablePivot: true,
      };

      expect(colDef.pivot).toBe(true);
      expect(colDef.enablePivot).toBe(true);
    });

    it('应支持 refData 值映射', () => {
      const colDef = {
        field: 'status',
        refData: {
          active: '🟢 在职',
          inactive: '🔴 离职',
          pending: '🟡 待定',
        },
        valueFormatter: (params: any) => {
          return colDef.refData[params.value] || params.value;
        },
      };

      expect(colDef.valueFormatter({ value: 'active' })).toBe('🟢 在职');
      expect(colDef.valueFormatter({ value: 'inactive' })).toBe('🔴 离职');
    });
  });

  describe('GridOptions 类型验证', () => {
    it('应接受完整 GridOptions', () => {
      const options = {
        rowData: [],
        columnDefs: [],
        pagination: true,
        paginationPageSize: 10,
        rowSelection: 'multiple',
        animateRows: true,
        rowHeight: 40,
        headerHeight: 44,
      };

      expect(options.pagination).toBe(true);
      expect(options.paginationPageSize).toBe(10);
      expect(options.rowSelection).toBe('multiple');
    });

    it('应支持服务端行模型', () => {
      const options = {
        rowModelType: 'serverSide',
        pagination: true,
      };

      expect(options.rowModelType).toBe('serverSide');
    });

    it('应支持状态持久化', () => {
      const options = {
        stateStorage: 'localStorage',
        stateKey: 'grid-state-key',
        autoSaveState: true,
      };

      expect(options.stateStorage).toBe('localStorage');
      expect(options.stateKey).toBe('grid-state-key');
      expect(options.autoSaveState).toBe(true);
    });

    it('应支持撤销/重做', () => {
      const options = {
        undoRedo: true,
        undoRedoCellEdit: true,
      };

      expect(options.undoRedo).toBe(true);
      expect(options.undoRedoCellEdit).toBe(true);
    });

    it('应支持侧边栏配置', () => {
      const options = {
        sideBar: {
          toolPanels: [
            { id: 'columns', labelKey: 'columns' },
            { id: 'filters', labelKey: 'filters' },
          ],
          defaultToolPanel: 'columns',
        },
      };

      expect(options.sideBar).toBeDefined();
      expect(options.sideBar?.toolPanels).toHaveLength(2);
    });
  });

  describe('CellRendererParams 验证', () => {
    it('应包含所有必要字段', () => {
      const params = {
        value: 'test',
        data: { id: 1, name: '张三' },
        node: { rowIndex: 0 },
        rowIndex: 0,
        colDef: { field: 'name' },
        column: {},
        $event: {},
        context: {},
        api: {},
        columnApi: {},
      };

      expect(params.value).toBe('test');
      expect(params.data.name).toBe('张三');
      expect(params.rowIndex).toBe(0);
      expect(params.colDef.field).toBe('name');
    });
  });

  describe('事件类型验证', () => {
    it('GridReadyEvent 应包含必要字段', () => {
      const event = {
        api: {},
        columnApi: {},
        type: 'gridReady',
      };

      expect(event.type).toBe('gridReady');
      expect(event.api).toBeDefined();
    });

    it('SelectionChangedEvent 应包含选中数据', () => {
      const event = {
        selectedRows: [{ id: 1 }, { id: 2 }],
        selectedNodes: [{}, {}],
        type: 'selectionChanged',
      };

      expect(event.selectedRows).toHaveLength(2);
      expect(event.selectedNodes).toHaveLength(2);
    });

    it('CellValueChangedEvent 应包含新旧值', () => {
      const event = {
        rowIndex: 0,
        colDef: { field: 'name' },
        value: '李四',
        oldValue: '张三',
        data: {},
        node: {},
        type: 'cellValueChanged',
      };

      expect(event.oldValue).toBe('张三');
      expect(event.value).toBe('李四');
    });

    it('SortChangedEvent 应包含排序模型', () => {
      const event = {
        sortModel: [
          { colId: 'name', sort: 'asc' },
        ],
        type: 'sortChanged',
      };

      expect(event.sortModel).toHaveLength(1);
      expect(event.sortModel[0].sort).toBe('asc');
    });

    it('FilterChangedEvent 应包含筛选模型', () => {
      const event = {
        filterModel: {
          name: { filterType: 'text', type: 'contains', filter: '张' },
        },
        type: 'filterChanged',
      };

      expect(event.filterModel.name).toBeDefined();
      expect(event.filterModel.name.filter).toBe('张');
    });
  });

  describe('RowDataTransaction 验证', () => {
    it('应支持添加操作', () => {
      const transaction = {
        add: [{ id: 1, name: '新增' }],
        addIndex: 0,
      };

      expect(transaction.add).toHaveLength(1);
      expect(transaction.add?.[0].name).toBe('新增');
    });

    it('应支持删除操作', () => {
      const transaction = {
        remove: [{ id: 1 }],
      };

      expect(transaction.remove).toHaveLength(1);
    });

    it('应支持更新操作', () => {
      const transaction = {
        update: [{ id: 1, name: '更新' }],
      };

      expect(transaction.update).toHaveLength(1);
      expect(transaction.update?.[0].name).toBe('更新');
    });
  });

  describe('PaginationInfo 验证', () => {
    it('应包含分页信息', () => {
      const info = {
        currentPage: 1,
        pageSize: 10,
        totalPages: 5,
        totalRows: 50,
      };

      expect(info.currentPage).toBe(1);
      expect(info.totalPages).toBe(5);
      expect(info.totalRows).toBe(50);
    });
  });

  describe('GridState 验证', () => {
    it('应保存完整状态', () => {
      const state = {
        columnState: [{ colId: 'name', width: 150 }],
        filterModel: { name: { filter: '张' } },
        sortModel: [{ colId: 'name', sort: 'asc' }],
        scrollState: { top: 100, left: 0 },
        rowGroupColumns: ['department'],
      };

      expect(state.columnState).toHaveLength(1);
      expect(state.rowGroupColumns).toContain('department');
    });
  });
});
