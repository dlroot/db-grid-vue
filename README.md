# DB Grid Vue 3 Wrapper

Vue 3 包装器，用于在 Vue 3 项目中使用 DB Grid 数据网格组件。

## 📦 安装

```bash
npm install db-grid-vue
# 或
yarn add db-grid-vue
# 或
pnpm add db-grid-vue
```

**注意**: 需要同时加载 DB Grid Web Component:

```html
<!-- index.html -->
<script src="https://unpkg.com/db-grid/dist/db-grid.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/db-grid/dist/db-grid.css">
```

## 🚀 快速开始

### 基础用法

```vue
<template>
  <DbGrid
    ref="gridRef"
    :row-data="dataSource"
    :column-defs="columns"
    height="500"
    @grid-ready="onGridReady"
    @selection-changed="onSelectionChanged"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DbGrid } from 'db-grid-vue';

const gridRef = ref(null);

const columns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: '姓名', width: 150, sortable: true },
  { field: 'age', headerName: '年龄', width: 100, filter: 'number' },
  { field: 'email', headerName: '邮箱', width: 200 },
];

const dataSource = [
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com' },
  { id: 2, name: '李四', age: 35, email: 'lisi@example.com' },
];

const onGridReady = (event) => {
  console.log('Grid ready:', event.api);
};

const onSelectionChanged = (rows) => {
  console.log('Selected rows:', rows);
};
</script>
```

### 使用 Composable

```vue
<template>
  <div>
    <div class="toolbar">
      <button @click="addRow">添加</button>
      <button @click="deleteSelected">删除</button>
      <span>选中: {{ selectedRows.length }} 行</span>
    </div>
    
    <DbGrid ref="gridRef" height="500" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DbGrid, useDbGrid } from 'db-grid-vue';

const selectedRows = ref([]);

const grid = useDbGrid({
  rowData: [
    { id: 1, name: '张三', age: 28 },
    { id: 2, name: '李四', age: 35 },
  ],
  columnDefs: [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: '姓名', width: 150 },
    { field: 'age', headerName: '年龄', width: 100 },
  ],
  onSelectionChanged: (rows) => {
    selectedRows.value = rows;
  },
});

const addRow = () => {
  const newRow = { id: Date.now(), name: '新用户', age: 25 };
  const api = grid.gridApi.value;
  if (api?.applyTransaction) {
    api.applyTransaction({ add: [newRow] });
  }
};

const deleteSelected = () => {
  const api = grid.gridApi.value;
  const selected = api?.getSelectedRows?.() || [];
  if (selected.length && api?.applyTransaction) {
    api.applyTransaction({ remove: selected });
  }
};
</script>
```

## 📖 API 文档

### Props (属性)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rowData` | `any[]` | - | 表格数据 |
| `columnDefs` | `ColDef[]` | - | 列定义 |
| `height` | `number \| string` | `500` | 高度 |
| `width` | `number \| string` | `'100%'` | 宽度 |
| `pagination` | `boolean` | `false` | 是否分页 |
| `paginationPageSize` | `number` | `10` | 每页条数 |
| `rowSelection` | `'single' \| 'multiple' \| 'checkbox'` | `'multiple'` | 选择模式 |
| `enableCellEdit` | `boolean` | `false` | 是否可编辑 |
| `editOnDoubleClick` | `boolean` | `true` | 双击编辑 |
| `rowDragEnabled` | `boolean` | `false` | 行拖拽 |
| `rangeSelection` | `boolean` | `false` | 范围选择 |
| `undoRedo` | `boolean` | `false` | 撤销/重做 |
| `quickFilterText` | `string` | - | 快速筛选文本 |
| `theme` | `string` | - | 主题 |
| `locale` | `string` | - | 国际化 |
| `gridOptions` | `GridOptions` | - | 高级配置 |

### Events (事件)

| 事件 | 参数 | 说明 |
|------|------|------|
| `gridReady` | `(event: GridReadyEvent)` | 网格就绪 |
| `selectionChanged` | `(rows: any[], nodes: any[])` | 选择变更 |
| `cellClicked` | `(event: CellClickedEvent)` | 单元格点击 |
| `cellDoubleClicked` | `(event: CellClickedEvent)` | 单元格双击 |
| `rowClicked` | `(event: RowClickedEvent)` | 行点击 |
| `rowDoubleClicked` | `(event: RowClickedEvent)` | 行双击 |
| `sortChanged` | `(event: SortChangedEvent)` | 排序变更 |
| `filterChanged` | `(event: FilterChangedEvent)` | 筛选变更 |
| `cellValueChanged` | `(event: CellValueChangedEvent)` | 单元格值变更 |
| `modelUpdated` | `(event: ModelUpdatedEvent)` | 模型更新 |
| `rowDataUpdated` | `(event: RowDataUpdatedEvent)` | 数据更新 |

### Ref API (命令式 API)

```vue
<template>
  <DbGrid ref="gridRef" />
</template>

<script setup lang="ts">
const gridRef = ref(null);

// 获取 GridApi
const api = gridRef.value?.getApi();

// 刷新视图
gridRef.value?.refresh();

// 导出 CSV
const csv = gridRef.value?.exportDataAsCsv();

// 选择操作
gridRef.value?.selectAll();
gridRef.value?.deselectAll();
const selectedRows = gridRef.value?.getSelectedRows();

// 排序
gridRef.value?.setSort('name', 'asc');

// 筛选
gridRef.value?.setQuickFilter('张三');

// 分页
gridRef.value?.nextPage();
gridRef.value?.previousPage();

// 撤销/重做
gridRef.value?.undo();
gridRef.value?.redo();
</script>
```

## 🎨 Composable API

### useDbGrid(options)

```ts
import { useDbGrid } from 'db-grid-vue';

const grid = useDbGrid({
  rowData: [],
  columnDefs: [],
  onGridReady: (event) => { /* ... */ },
  onSelectionChanged: (rows) => { /* ... */ },
});

// 返回值
{
  // 状态
  gridApi: Ref<GridApi | null>,
  loading: Ref<boolean>,
  data: Ref<any[]>,
  selectedRows: Ref<any[]>,
  isReady: Ref<boolean>,
  
  // 方法
  setRowData: (data: any[]) => void,
  setColumns: (columns: ColDef[]) => void,
  setLoading: (loading: boolean) => void,
  refresh: () => void,
  exportData: (format: 'csv' | 'excel' | 'pdf') => void,
  undo: () => boolean,
  redo: () => boolean,
  selectAll: () => void,
  deselectAll: () => void,
  getSelectedRows: () => any[],
  setSort: (field: string, direction: 'asc' | 'desc' | null) => void,
  setQuickFilter: (text: string) => void,
  nextPage: () => void,
  previousPage: () => void,
  firstPage: () => void,
  lastPage: () => void,
  setPageSize: (size: number) => void,
}
```

### 高级 Composable

```ts
import { usePagedDbGrid, useSelectableDbGrid, useEditableDbGrid } from 'db-grid-vue';

// 带分页
const pagedGrid = usePagedDbGrid({ pageSize: 20 });
pagedGrid.goToPage(5);

// 带选择
const selectableGrid = useSelectableDbGrid({ selectionType: 'checkbox' });
selectableGrid.toggleRowSelection(0);

// 带编辑
const editableGrid = useEditableDbGrid();
editableGrid.startEdit(0, 'name');
editableGrid.stopEdit();
```

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run typecheck
```

## 📚 参考资料

- [DB Grid 主项目](https://github.com/qclaw/db-grid)
- [DB Grid Angular Elements](https://github.com/qclaw/db-grid-elements)
- [Vue 3 官方文档](https://vuejs.org)

## 📝 License

MIT © QClaw
