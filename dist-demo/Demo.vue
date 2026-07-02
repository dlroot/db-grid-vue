<template>
  <div class="demo-container">
    <h1>DB Grid Vue 3 示例</h1>
    
    <!-- 示例导航 -->
    <nav class="demo-nav">
      <button 
        v-for="(demo, index) in demos" 
        :key="index"
        :class="{ active: currentDemo === index }"
        @click="currentDemo = index"
      >
        {{ demo.title }}
      </button>
    </nav>
    
    <!-- ========== 1. 基础用法 ========== -->
    <section v-if="currentDemo === 0" class="demo-section">
      <h2>1. 基础用法</h2>
      <p class="demo-desc">最简单的数据表格展示，支持选择和基本操作</p>
      
      <DbGrid
        ref="basicGrid"
        :row-data="basicData"
        :column-defs="basicColumns"
        :pagination="false"
        height="350"
        @grid-ready="onBasicGridReady"
        @selection-changed="onSelectionChanged"
        @cell-clicked="onCellClicked"
      />
      
      <div class="demo-toolbar">
        <button @click="basicGrid?.selectAll()">全选</button>
        <button @click="basicGrid?.deselectAll()">取消全选</button>
        <button @click="basicGrid?.refresh()">刷新</button>
        <button @click="basicGrid?.sizeColumnsToFit()">自适应列宽</button>
        <button @click="basicGrid?.exportDataAsCsv({ fileName: '基础数据.csv' })">导出 CSV</button>
        <span class="selected-info">已选中 {{ selectedRows.length }} 行</span>
      </div>
      
      <div class="event-log">
        <strong>事件日志:</strong>
        <pre>{{ eventLogs.basic }}</pre>
      </div>
    </section>
    
    <!-- ========== 2. 分页 + 排序 + 筛选 ========== -->
    <section v-if="currentDemo === 1" class="demo-section">
      <h2>2. 分页 + 排序 + 筛选</h2>
      <p class="demo-desc">支持快速筛选、多列排序、列筛选和分页导航</p>
      
      <div class="demo-toolbar">
        <input 
          v-model="quickFilter" 
          placeholder="快速搜索..."
          @input="onQuickFilter"
        />
        <select v-model="departmentFilter" @change="onDepartmentFilter">
          <option value="">全部部门</option>
          <option value="技术部">技术部</option>
          <option value="产品部">产品部</option>
          <option value="设计部">设计部</option>
          <option value="市场部">市场部</option>
        </select>
      </div>
      
      <DbGrid
        ref="pagedGrid"
        :row-data="largeData"
        :column-defs="pagedColumns"
        :pagination="true"
        :pagination-page-size="pageSize"
        height="400"
        @grid-ready="onPagedGridReady"
        @sort-changed="onSortChanged"
        @filter-changed="onFilterChanged"
      />
      
      <div class="demo-toolbar pagination-bar">
        <button @click="goToFirstPage" :disabled="currentPage <= 1">首页</button>
        <button @click="goToPrevPage" :disabled="currentPage <= 1">上一页</button>
        <span class="page-info">
          第 <input type="number" v-model.number="jumpPage" min="1" :max="totalPages" @keyup.enter="goToPage"> / {{ totalPages }} 页
        </span>
        <span class="page-info">共 {{ displayedRowCount }} 条</span>
        <button @click="goToNextPage" :disabled="currentPage >= totalPages">下一页</button>
        <button @click="goToLastPage" :disabled="currentPage >= totalPages">末页</button>
        <select v-model="pageSize" @change="onPageSizeChange">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
          <option :value="100">100条/页</option>
        </select>
      </div>
      
      <div class="event-log">
        <strong>排序/筛选状态:</strong>
        <pre>{{ eventLogs.paged }}</pre>
      </div>
    </section>
    
    <!-- ========== 3. 可编辑单元格 ========== -->
    <section v-if="currentDemo === 2" class="demo-section">
      <h2>3. 可编辑单元格</h2>
      <p class="demo-desc">双击单元格进入编辑模式，支持多种编辑器</p>
      
      <DbGrid
        ref="editableGrid"
        :row-data="editableData"
        :column-defs="editableColumns"
        :enable-cell-edit="true"
        :edit-on-double-click="true"
        :undo-redo="true"
        height="350"
        @cell-value-changed="onCellValueChanged"
      />
      
      <div class="demo-toolbar">
        <button @click="editableGrid?.undo()" :disabled="!canUndo">撤销</button>
        <button @click="editableGrid?.redo()" :disabled="!canRedo">重做</button>
        <button @click="resetEditableData">重置数据</button>
        <button @click="saveEditableData">保存修改</button>
      </div>
      
      <div class="event-log">
        <strong>修改记录:</strong>
        <pre>{{ eventLogs.editable }}</pre>
      </div>
    </section>
    
    <!-- ========== 4. 使用 Composable ========== -->
    <section v-if="currentDemo === 3" class="demo-section">
      <h2>4. 使用 Composable</h2>
      <p class="demo-desc">通过 useDbGrid composable 管理状态和操作</p>
      
      <div class="demo-toolbar">
        <button @click="addRow">添加行</button>
        <button @click="updateRow">更新行</button>
        <button @click="deleteSelectedRows">删除选中</button>
        <span class="status-badge" :class="{ loading: composableState.loading }">
          {{ composableState.loading ? '加载中...' : `${composableState.data.length} 条数据` }}
        </span>
      </div>
      
      <DbGrid
        ref="composableGridRef"
        height="350"
        @grid-ready="onComposableGridReady"
        @selection-changed="onComposableSelectionChanged"
      />
      
      <div class="composable-state">
        <h4>Composable 状态:</h4>
        <ul>
          <li><strong>isReady:</strong> {{ composableState.isReady }}</li>
          <li><strong>selectedRows:</strong> {{ composableState.selectedRows.length }} 条</li>
          <li><strong>currentPage:</strong> {{ composableState.currentPage }}</li>
          <li><strong>totalPages:</strong> {{ composableState.totalPages }}</li>
        </ul>
      </div>
    </section>
    
    <!-- ========== 5. 高级 Composable ========== -->
    <section v-if="currentDemo === 4" class="demo-section">
      <h2>5. 高级 Composable</h2>
      <p class="demo-desc">usePagedDbGrid / useSelectableDbGrid / useEditableDbGrid</p>
      
      <div class="tabs">
        <button 
          v-for="(tab, index) in advancedTabs" 
          :key="index"
          :class="{ active: advancedTab === index }"
          @click="advancedTab = index"
        >
          {{ tab }}
        </button>
      </div>
      
      <!-- usePagedDbGrid 示例 -->
      <div v-if="advancedTab === 0">
        <p>usePagedDbGrid - 内置分页状态管理</p>
        <div class="demo-toolbar">
          <button @click="pagedGridHelper?.goToPage(1)">跳转第1页</button>
          <button @click="pagedGridHelper?.goToPage(5)">跳转第5页</button>
          <span>当前页: {{ pagedState.currentPage }}</span>
        </div>
        <div ref="pagedGridContainer"></div>
      </div>
      
      <!-- useSelectableDbGrid 示例 -->
      <div v-if="advancedTab === 1">
        <p>useSelectableDbGrid - 高级选择功能</p>
        <div class="demo-toolbar">
          <button @click="selectableGridHelper?.selectAllRows()">全选</button>
          <button @click="selectableGridHelper?.clearSelection()">清除</button>
          <button @click="selectableGridHelper?.toggleRowSelection(2)">切换第3行</button>
          <span>选中: {{ selectableState.selectedRows.length }} 行</span>
        </div>
        <div ref="selectableGridContainer"></div>
      </div>
      
      <!-- useEditableDbGrid 示例 -->
      <div v-if="advancedTab === 2">
        <p>useEditableDbGrid - 单元格编辑</p>
        <div class="demo-toolbar">
          <button @click="editableGridHelper?.startEdit(0, 'name')">编辑第1行姓名</button>
          <button @click="editableGridHelper?.stopEdit()">停止编辑</button>
          <span>{{ editableGridHelper?.isEditing() ? '正在编辑...' : '未编辑' }}</span>
        </div>
        <div ref="editableGridContainer"></div>
      </div>
    </section>
    
    <!-- ========== 6. 列固定 ========== -->
    <section v-if="currentDemo === 5" class="demo-section">
      <h2>6. 列固定</h2>
      <p class="demo-desc">固定左侧或右侧列，方便浏览大量数据</p>
      
      <DbGrid
        ref="pinnedGrid"
        :row-data="basicData"
        :column-defs="pinnedColumns"
        height="350"
        @grid-ready="onPinnedGridReady"
      />
      
      <div class="demo-toolbar">
        <button @click="pinColumn('left')">固定下一列到左侧</button>
        <button @click="pinColumn('right')">固定下一列到右侧</button>
        <button @click="unpinColumn">取消固定</button>
      </div>
    </section>
    
    <!-- ========== 7. 行分组 ========== -->
    <section v-if="currentDemo === 6" class="demo-section">
      <h2>7. 行分组</h2>
      <p class="demo-desc">按指定列进行分组展示</p>
      
      <DbGrid
        ref="groupedGrid"
        :row-data="groupedData"
        :column-defs="groupedColumns"
        :grid-options="groupedOptions"
        height="400"
        @grid-ready="onGroupedGridReady"
      />
      
      <div class="demo-toolbar">
        <button @click="expandAllGroups">展开全部</button>
        <button @click="collapseAllGroups">收起全部</button>
      </div>
    </section>
    
    <!-- ========== 8. 状态持久化 ========== -->
    <section v-if="currentDemo === 7" class="demo-section">
      <h2>8. 状态持久化</h2>
      <p class="demo-desc">保存和恢复网格的列宽、排序、筛选等状态</p>
      
      <DbGrid
        ref="stateGrid"
        :row-data="basicData"
        :column-defs="stateColumns"
        height="350"
        @grid-ready="onStateGridReady"
      />
      
      <div class="demo-toolbar">
        <button @click="saveState">保存状态</button>
        <button @click="loadState">加载状态</button>
        <button @click="resetState">重置状态</button>
        <button @click="saveToLocalStorage">保存到 LocalStorage</button>
        <button @click="loadFromLocalStorage">从 LocalStorage 加载</button>
      </div>
      
      <div class="event-log">
        <strong>当前状态:</strong>
        <pre>{{ savedState }}</pre>
      </div>
    </section>
    
    <!-- ========== 9. Transaction 操作 ========== -->
    <section v-if="currentDemo === 8" class="demo-section">
      <h2>9. Transaction 操作</h2>
      <p class="demo-desc">高效更新数据，增量添加/删除/修改</p>
      
      <DbGrid
        ref="transactionGrid"
        :row-data="transactionData"
        :column-defs="transactionColumns"
        height="350"
        @grid-ready="onTransactionGridReady"
      />
      
      <div class="demo-toolbar">
        <button @click="addTransactionRow">添加行 (Add)</button>
        <button @click="updateTransactionRow">更新行 (Update)</button>
        <button @click="deleteTransactionRow">删除行 (Remove)</button>
        <button @click="batchTransaction">批量操作</button>
      </div>
      
      <div class="event-log">
        <strong>操作日志:</strong>
        <pre>{{ transactionLogs }}</pre>
      </div>
    </section>
    
    <!-- ========== 10. 导出功能 ========== -->
    <section v-if="currentDemo === 9" class="demo-section">
      <h2>10. 导出功能</h2>
      <p class="demo-desc">支持 CSV、Excel、PDF 多种导出格式</p>
      
      <DbGrid
        ref="exportGrid"
        :row-data="basicData"
        :column-defs="exportColumns"
        height="350"
        @grid-ready="onExportGridReady"
      />
      
      <div class="demo-toolbar">
        <button @click="exportCsv">导出 CSV</button>
        <button @click="exportExcel">导出 Excel</button>
        <button @click="exportPdf">导出 PDF</button>
        <button @click="exportSelected">导出选中行</button>
        <button @click="exportCustom">自定义导出</button>
      </div>
      
      <div class="event-log">
        <strong>导出配置:</strong>
        <pre>{{ exportConfig }}</pre>
      </div>
    </section>
    
    <!-- ========== 11. 滚动定位 ========== -->
    <section v-if="currentDemo === 10" class="demo-section">
      <h2>11. 滚动定位</h2>
      <p class="demo-desc">滚动到指定行或列</p>
      
      <DbGrid
        ref="scrollGrid"
        :row-data="largeData"
        :column-defs="scrollColumns"
        height="350"
        @grid-ready="onScrollGridReady"
      />
      
      <div class="demo-toolbar">
        <span>跳转到行:</span>
        <input type="number" v-model.number="scrollToRow" min="1" :max="1000" />
        <select v-model="scrollAlign">
          <option value="auto">自动</option>
          <option value="top">顶部</option>
          <option value="middle">中间</option>
          <option value="bottom">底部</option>
        </select>
        <button @click="scrollToRowIndex">执行</button>
        <button @click="scrollToTop">回到顶部</button>
        <button @click="scrollToBottom">滚到底部</button>
      </div>
    </section>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { 
  DbGrid, 
  useDbGrid, 
  usePagedDbGrid, 
  useSelectableDbGrid, 
  useEditableDbGrid 
} from '../src/index.ts';

// ============ 示例导航 ============
const currentDemo = ref(0);
const demos = [
  { title: '基础用法' },
  { title: '分页+筛选' },
  { title: '单元格编辑' },
  { title: 'Composable' },
  { title: '高级Composable' },
  { title: '列固定' },
  { title: '行分组' },
  { title: '状态持久化' },
  { title: 'Transaction' },
  { title: '导出功能' },
  { title: '滚动定位' },
];

// ============ 示例数据 ============
const basicData = ref([
  { id: 1, name: '张三', age: 28, email: 'zhangsan@example.com', department: '技术部', salary: 15000, status: 'active', joinDate: '2020-01-15' },
  { id: 2, name: '李四', age: 35, email: 'lisi@example.com', department: '产品部', salary: 18000, status: 'active', joinDate: '2019-06-20' },
  { id: 3, name: '王五', age: 42, email: 'wangwu@example.com', department: '设计部', salary: 20000, status: 'inactive', joinDate: '2018-03-10' },
  { id: 4, name: '赵六', age: 31, email: 'zhaoliu@example.com', department: '市场部', salary: 16000, status: 'active', joinDate: '2021-09-05' },
  { id: 5, name: '钱七', age: 26, email: 'qianqi@example.com', department: '技术部', salary: 12000, status: 'active', joinDate: '2022-02-28' },
  { id: 6, name: '孙八', age: 38, email: 'sunba@example.com', department: '财务部', salary: 19000, status: 'active', joinDate: '2017-11-12' },
  { id: 7, name: '周九', age: 29, email: 'zhoujiu@example.com', department: '技术部', salary: 14000, status: 'active', joinDate: '2021-04-18' },
  { id: 8, name: '吴十', age: 45, email: 'wushi@example.com', department: '人力资源部', salary: 22000, status: 'inactive', joinDate: '2016-07-22' },
]);

const generateLargeData = (count = 200) => {
  const departments = ['技术部', '产品部', '设计部', '市场部', '人力资源部', '财务部'];
  const statuses = ['active', 'inactive'];
  const names = ['张', '李', '王', '赵', '钱', '孙', '周', '吴', '郑', '陈'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${names[Math.floor(Math.random() * names.length)]}${['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'][Math.floor(Math.random() * 10)]}`,
    age: Math.floor(Math.random() * 30) + 22,
    email: `user${i + 1}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 20000) + 8000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    joinDate: `20${Math.floor(Math.random() * 6) + 18}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  }));
};

const largeData = ref(generateLargeData(200));
const editableData = ref(JSON.parse(JSON.stringify(basicData.value)));

// ============ 列定义 ============
const basicColumns = [
  { field: 'id', headerName: 'ID', width: 70, checkboxSelection: true },
  { field: 'name', headerName: '姓名', width: 100, sortable: true },
  { field: 'age', headerName: '年龄', width: 80, sortable: true },
  { field: 'department', headerName: '部门', width: 120, filter: true },
  { field: 'salary', headerName: '薪资', width: 120, sortable: true },
  { field: 'status', headerName: '状态', width: 100 },
];

const pagedColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: '姓名', width: 100, sortable: true, filter: true },
  { field: 'age', headerName: '年龄', width: 80, sortable: true, filter: 'number' },
  { field: 'department', headerName: '部门', width: 120, filter: true },
  { field: 'salary', headerName: '薪资', width: 120, sortable: true, filter: 'number' },
  { field: 'status', headerName: '状态', width: 100, filter: true },
  { field: 'joinDate', headerName: '入职日期', width: 130 },
];

const editableColumns = [
  { field: 'id', headerName: 'ID', width: 70, editable: false },
  { field: 'name', headerName: '姓名', width: 120, editable: true, sortable: true },
  { field: 'age', headerName: '年龄', width: 100, editable: true, filter: 'number' },
  { field: 'email', headerName: '邮箱', width: 200, editable: true },
  { 
    field: 'department', 
    headerName: '部门', 
    width: 130, 
    editable: true,
    filter: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: ['技术部', '产品部', '设计部', '市场部', '人力资源部', '财务部'] }
  },
  { 
    field: 'status', 
    headerName: '状态', 
    width: 100,
    editable: true,
    valueFormatter: (params: any) => params.value === 'active' ? '🟢 在职' : '🔴 离职',
  },
];

const pinnedColumns = [
  { field: 'id', headerName: 'ID', width: 70, pinned: 'left', checkboxSelection: true },
  { field: 'name', headerName: '姓名', width: 120 },
  { field: 'age', headerName: '年龄', width: 80 },
  { field: 'email', headerName: '邮箱', width: 200 },
  { field: 'department', headerName: '部门', width: 120 },
  { field: 'salary', headerName: '薪资', width: 120 },
  { field: 'status', headerName: '状态', width: 100 },
  { field: 'joinDate', headerName: '入职日期', width: 130, pinned: 'right' },
];

const groupedData = ref([
  { department: '技术部', name: '张三', salary: 15000 },
  { department: '技术部', name: '李四', salary: 18000 },
  { department: '技术部', name: '钱七', salary: 12000 },
  { department: '产品部', name: '王五', salary: 20000 },
  { department: '产品部', name: '赵六', salary: 16000 },
  { department: '设计部', name: '孙八', salary: 19000 },
]);

const groupedColumns = [
  { field: 'department', headerName: '部门', rowGroup: true, width: 150 },
  { field: 'name', headerName: '姓名', width: 150 },
  { field: 'salary', headerName: '薪资', width: 120, aggregation: 'sum' },
];

const groupedOptions = {
  animateRows: true,
  enableRangeSelection: true,
};

const stateColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: '姓名', width: 120, sortable: true },
  { field: 'age', headerName: '年龄', width: 100, sortable: true },
  { field: 'department', headerName: '部门', width: 120, filter: true },
  { field: 'salary', headerName: '薪资', width: 120 },
];

const transactionColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: '姓名', width: 150 },
  { field: 'department', headerName: '部门', width: 120 },
  { field: 'salary', headerName: '薪资', width: 120 },
  { field: 'status', headerName: '状态', width: 100 },
];

const exportColumns = [
  { field: 'id', headerName: 'ID' },
  { field: 'name', headerName: '姓名' },
  { field: 'age', headerName: '年龄' },
  { field: 'department', headerName: '部门' },
  { field: 'salary', headerName: '薪资' },
  { field: 'status', headerName: '状态' },
  { field: 'joinDate', headerName: '入职日期' },
];

const scrollColumns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: '姓名', width: 120 },
  { field: 'age', headerName: '年龄', width: 80 },
  { field: 'email', headerName: '邮箱', width: 200 },
  { field: 'department', headerName: '部门', width: 120 },
  { field: 'salary', headerName: '薪资', width: 120 },
  { field: 'status', headerName: '状态', width: 100 },
  { field: 'joinDate', headerName: '入职日期', width: 130 },
];

// ============ Refs ============
const basicGrid = ref<any>(null);
const pagedGrid = ref<any>(null);
const editableGrid = ref<any>(null);
const composableGridRef = ref<any>(null);
const pinnedGrid = ref<any>(null);
const groupedGrid = ref<any>(null);
const stateGrid = ref<any>(null);
const transactionGrid = ref<any>(null);
const exportGrid = ref<any>(null);
const scrollGrid = ref<any>(null);

// ============ 状态 ============
const selectedRows = ref<any[]>([]);
const quickFilter = ref('');
const departmentFilter = ref('');
const currentPage = ref(1);
const totalPages = ref(0);
const displayedRowCount = ref(0);
const pageSize = ref(10);
const jumpPage = ref(1);
const canUndo = ref(false);
const canRedo = ref(false);
const savedState = ref({});

const eventLogs = reactive({
  basic: '等待事件...',
  paged: '等待事件...',
  editable: [],
  transaction: [],
});

const transactionData = ref([...basicData.value.slice(0, 5)]);
const transactionLogs = ref([]);

const exportConfig = ref({
  format: 'csv',
  fileName: 'export.csv',
  skipHeaders: false,
});

const scrollToRow = ref(50);
const scrollAlign = ref('middle');

// ============ Composable 状态 ============
const composableState = reactive({
  isReady: false,
  selectedRows: [] as any[],
  currentPage: 1,
  totalPages: 0,
  data: [...basicData.value],
  loading: false,
});

const composable = useDbGrid({
  rowData: composableState.data,
  columnDefs: basicColumns,
  onGridReady: (event) => {
    composableState.isReady = true;
    composable.gridApi.value = event.api;
  },
  onSelectionChanged: (rows) => {
    composableState.selectedRows = rows;
  },
});

// ============ 高级 Composable ============
const advancedTab = ref(0);
const advancedTabs = ['usePagedDbGrid', 'useSelectableDbGrid', 'useEditableDbGrid'];

const pagedState = reactive({ currentPage: 1 });
const selectableState = reactive({ selectedRows: [] as any[] });
const editableState = reactive({ isEditing: false });

let pagedGridHelper: any = null;
let selectableGridHelper: any = null;
let editableGridHelper: any = null;

// ============ 事件处理 ============

// 基础网格
const onBasicGridReady = (event: any) => {
  eventLogs.basic = `Grid Ready - API 已就绪`;
};

const onCellClicked = (event: any) => {
  eventLogs.basic = `单元格点击: [${event.colDef.field}] = ${event.value}`;
};

const onSelectionChanged = (rows: any[]) => {
  selectedRows.value = rows;
};

// 分页网格
const onPagedGridReady = (event: any) => {
  updatePagination();
};

const onSortChanged = (event: any) => {
  eventLogs.paged = `排序: ${JSON.stringify(event.sortModel)}`;
};

const onFilterChanged = (event: any) => {
  eventLogs.paged = `筛选: ${JSON.stringify(event.filterModel)}`;
  updatePagination();
};

const updatePagination = () => {
  const api = pagedGrid.value?.getApi();
  if (api) {
    const info = api.getPaginationInfo?.();
    if (info) {
      currentPage.value = info.currentPage;
      totalPages.value = info.totalPages;
      displayedRowCount.value = info.totalRows;
    }
  }
};

const onQuickFilter = () => {
  pagedGrid.value?.setQuickFilter(quickFilter.value);
};

const onDepartmentFilter = () => {
  const api = pagedGrid.value?.getApi();
  if (api) {
    if (departmentFilter.value) {
      api.setFilterModel({ department: { filterType: 'text', type: 'equals', filter: departmentFilter.value } });
    } else {
      api.setFilterModel({});
    }
  }
};

const goToFirstPage = () => { pagedGrid.value?.firstPage(); updatePagination(); };
const goToPrevPage = () => { pagedGrid.value?.previousPage(); updatePagination(); };
const goToNextPage = () => { pagedGrid.value?.nextPage(); updatePagination(); };
const goToLastPage = () => { pagedGrid.value?.lastPage(); updatePagination(); };
const goToPage = () => { 
  if (jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    while (currentPage.value < jumpPage.value) pagedGrid.value?.nextPage();
    while (currentPage.value > jumpPage.value) pagedGrid.value?.previousPage();
    updatePagination();
  }
};
const onPageSizeChange = () => { 
  pagedGrid.value?.setPageSize(pageSize.value); 
  updatePagination();
};

// 可编辑网格
const onCellValueChanged = (event: any) => {
  eventLogs.editable.push({
    time: new Date().toLocaleTimeString(),
    row: event.rowIndex,
    field: event.colDef.field,
    oldValue: event.oldValue,
    newValue: event.value,
  });
  if (eventLogs.editable.length > 5) eventLogs.editable.shift();
  
  const api = editableGrid.value?.getApi();
  canUndo.value = api?.canUndo?.() || false;
  canRedo.value = api?.canRedo?.() || false;
};

const resetEditableData = () => {
  editableData.value = JSON.parse(JSON.stringify(basicData.value));
  editableGrid.value?.setRowData(editableData.value);
};

const saveEditableData = () => {
  console.log('保存数据:', editableGrid.value?.getRowData());
  alert('数据已保存到控制台');
};

// Composable 网格
const onComposableGridReady = (event: any) => {
  composable.gridApi.value = event.api;
  composableState.isReady = true;
  composable.gridApi.value.setRowData(composableState.data);
};

const onComposableSelectionChanged = (rows: any[]) => {
  composableState.selectedRows = rows;
};

const addRow = () => {
  const newId = Math.max(...composableState.data.map(d => d.id), 0) + 1;
  const newRow = {
    id: newId,
    name: `新用户${newId}`,
    age: 25,
    email: `new${newId}@example.com`,
    department: '技术部',
    salary: 10000,
    status: 'active',
  };
  composableState.data.push(newRow);
  composable.setRowData([...composableState.data]);
};

const updateRow = () => {
  if (composableState.selectedRows.length > 0) {
    const row = composableState.selectedRows[0];
    row.salary = Math.floor(Math.random() * 10000) + 10000;
    composable.setRowData([...composableState.data]);
  }
};

const deleteSelectedRows = () => {
  composableState.data = composableState.data.filter(
    d => !composableState.selectedRows.some(s => s.id === d.id)
  );
  composable.setRowData([...composableState.data]);
};

// 列固定
const onPinnedGridReady = (event: any) => {
  console.log('Pinned grid ready');
};

let nextColumnToPin = 'left';

const pinColumn = (side: 'left' | 'right') => {
  nextColumnToPin = side;
};

const unpinColumn = () => {
  console.log('Unpin column');
};

// 行分组
const onGroupedGridReady = (event: any) => {
  console.log('Grouped grid ready');
};

const expandAllGroups = () => {
  groupedGrid.value?.getApi()?.expandAllGroups();
};

const collapseAllGroups = () => {
  groupedGrid.value?.getApi()?.collapseAllGroups();
};

// 状态持久化
const onStateGridReady = (event: any) => {
  console.log('State grid ready');
};

const saveState = () => {
  savedState.value = stateGrid.value?.saveState?.() || stateGrid.value?.getApi()?.getState?.() || {};
};

const loadState = () => {
  stateGrid.value?.restoreState?.(savedState.value) || stateGrid.value?.getApi()?.setState?.(savedState.value);
};

const resetState = () => {
  stateGrid.value?.getApi()?.resetColumnState?.();
  savedState.value = {};
};

const saveToLocalStorage = () => {
  const state = stateGrid.value?.getApi()?.getState?.();
  localStorage.setItem('db-grid-state', JSON.stringify(state));
};

const loadFromLocalStorage = () => {
  const stateStr = localStorage.getItem('db-grid-state');
  if (stateStr) {
    const state = JSON.parse(stateStr);
    stateGrid.value?.getApi()?.setState?.(state);
  }
};

// Transaction
const onTransactionGridReady = (event: any) => {
  console.log('Transaction grid ready');
};

const addTransactionRow = () => {
  const api = transactionGrid.value?.getApi();
  if (api?.applyTransaction) {
    const newRow = {
      id: Date.now(),
      name: `新增用户`,
      department: '技术部',
      salary: 15000,
      status: 'active',
    };
    api.applyTransaction({ add: [newRow] });
    transactionLogs.value.push(`添加: ${newRow.name}`);
  }
};

const updateTransactionRow = () => {
  const api = transactionGrid.value?.getApi();
  if (api?.applyTransaction && transactionData.value.length > 0) {
    const updated = { ...transactionData.value[0], salary: Math.floor(Math.random() * 10000) + 10000 };
    api.applyTransaction({ update: [updated] });
    transactionLogs.value.push(`更新: ${updated.name} 薪资为 ${updated.salary}`);
  }
};

const deleteTransactionRow = () => {
  const api = transactionGrid.value?.getApi();
  if (api?.applyTransaction && transactionData.value.length > 0) {
    const removed = transactionData.value[0];
    api.applyTransaction({ remove: [removed] });
    transactionData.value = transactionData.value.slice(1);
    transactionLogs.value.push(`删除: ${removed.name}`);
  }
};

const batchTransaction = () => {
  const api = transactionGrid.value?.getApi();
  if (api?.applyTransaction) {
    api.applyTransaction({
      add: [{ id: Date.now(), name: '批量新增', department: '市场部', salary: 12000, status: 'active' }],
      update: transactionData.value.slice(0, 2).map(r => ({ ...r, salary: r.salary + 1000 })),
    });
    transactionLogs.value.push('批量操作完成');
  }
};

// 导出
const onExportGridReady = (event: any) => {
  console.log('Export grid ready');
};

const exportCsv = () => {
  exportConfig.value.format = 'csv';
  exportConfig.value.fileName = '员工数据.csv';
  const csv = exportGrid.value?.exportDataAsCsv(exportConfig.value);
  console.log('CSV导出:', csv);
};

const exportExcel = () => {
  exportConfig.value.format = 'excel';
  exportConfig.value.fileName = '员工数据.xlsx';
  exportGrid.value?.downloadExcel(exportConfig.value);
};

const exportPdf = () => {
  exportConfig.value.format = 'pdf';
  exportConfig.value.fileName = '员工数据.pdf';
  exportGrid.value?.exportDataAsPdf(exportConfig.value);
};

const exportSelected = () => {
  exportGrid.value?.getApi()?.getSelectedRows?.() || [];
};

const exportCustom = () => {
  exportConfig.value.fileName = '自定义导出.csv';
};

// 滚动
const onScrollGridReady = (event: any) => {
  console.log('Scroll grid ready');
};

const scrollToRowIndex = () => {
  scrollGrid.value?.ensureIndexVisible(scrollToRow.value - 1, scrollAlign.value);
};

const scrollToTop = () => {
  scrollGrid.value?.ensureIndexVisible(0, 'top');
};

const scrollToBottom = () => {
  scrollGrid.value?.ensureIndexVisible(999, 'bottom');
};

// ============ 初始化 ============
onMounted(() => {
  composable.setRowData(composableState.data);
});
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.demo-nav button {
  padding: 8px 16px;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-nav button:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.demo-nav button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.demo-section {
  margin-bottom: 40px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h2 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-size: 20px;
}

.demo-desc {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.demo-toolbar {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.demo-toolbar input[type="text"],
.demo-toolbar input[type="number"] {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  width: 150px;
}

.demo-toolbar select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  min-width: 120px;
}

button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #40a9ff;
}

button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.selected-info,
.page-info,
.status-badge {
  margin-left: 12px;
  color: #666;
  font-size: 14px;
}

.pagination-bar {
  justify-content: center;
}

.event-log {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.event-log strong {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.event-log pre {
  margin: 0;
  white-space: pre-wrap;
  font-size: 12px;
  color: #666;
  font-family: 'Monaco', 'Menlo', monospace;
}

.composable-state {
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.composable-state h4 {
  margin: 0 0 12px 0;
}

.composable-state ul {
  margin: 0;
  padding-left: 20px;
}

.composable-state li {
  margin-bottom: 4px;
  color: #666;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tabs button {
  background: #f0f0f0;
  color: #333;
}

.tabs button.active {
  background: #1890ff;
  color: white;
}
</style>
