# Testing Guide

## 测试框架

使用 [Vitest](https://vitest.dev/) 作为测试框架，配合 `@vue/test-utils` 进行 Vue 组件测试。

## 测试文件结构

```
src/
├── __tests__/
│   ├── db-grid-vue.types.spec.ts     # 类型定义测试
│   ├── useDbGrid.spec.ts             # Composable 测试
│   └── DbGridVue.component.spec.ts   # 组件行为测试
```

## 运行测试

```bash
# 运行所有测试
npm test

# 监听模式 (文件变更时自动重新运行)
npm run test:watch

# 运行覆盖率报告
npm run test:coverage

# 运行测试并打开 UI
npm run test:ui

# 单次运行 (CI 模式)
npm run test:run
```

## 覆盖率目标

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## 测试用例说明

### 1. 类型测试 (`db-grid-vue.types.spec.ts`)

测试 TypeScript 类型定义的完整性和正确性：

- `ColDef` - 列定义类型验证
- `GridOptions` - 网格配置类型验证
- `CellRendererParams` - 单元格渲染参数验证
- 事件类型验证 (GridReadyEvent, SelectionChangedEvent 等)
- `RowDataTransaction` - 数据事务验证
- `PaginationInfo` - 分页信息验证
- `GridState` - 状态持久化验证

### 2. Composable 测试 (`useDbGrid.spec.ts`)

测试 `useDbGrid` composable 的所有功能：

**初始化测试**
- 空状态初始化
- 初始数据设置
- 回调函数绑定

**数据操作**
- `setRowData` - 更新数据
- `setColumns` - 更新列定义
- Transaction 操作

**选择操作**
- `selectAll` / `deselectAll`
- `getSelectedRows`

**排序和筛选**
- `setSort` - 排序
- `setQuickFilter` - 快速筛选

**分页操作**
- `nextPage` / `previousPage`
- `firstPage` / `lastPage`
- `setPageSize`

**导出功能**
- CSV 导出
- Excel 导出
- PDF 导出

**撤销/重做**
- `undo` / `redo`

**集成场景**
- CRUD 流程
- 分页导航流程
- 筛选-导出流程
- 撤销/重做工作流

### 3. 组件测试 (`DbGridVue.component.spec.ts`)

测试 Vue 组件的行为和属性：

**Props 验证**
- 基础 Props
- 选择相关 Props
- 编辑相关 Props
- 高级功能 Props
- 尺寸、主题、状态持久化等

**Events 验证**
- gridReady
- selectionChanged
- cellClicked / cellDoubleClicked
- rowClicked / rowDoubleClicked
- sortChanged / filterChanged
- cellValueChanged
- modelUpdated / rowDataUpdated

**Ref API 验证**
- 基础 API (refresh, getApi)
- 导出 API
- 选择 API
- 排序/筛选 API
- 分页 API
- 数据 API
- 撤销/重做 API
- Transaction API
- 状态 API

**Computed 属性验证**
- resolvedHeight / resolvedWidth
- containerStyle

**Watchers 验证**
- rowData 变化监听
- columnDefs 变化监听
- pagination 变化监听
- quickFilterText 变化监听

**集成测试场景**
- 从初始化到导出的完整流程
- 分页完整流程
- 选择和编辑流程

## Mock API

测试中使用 `createMockGridApi()` 创建模拟的 GridApi，用于隔离测试：

```typescript
const mockApi = createMockGridApi();
mockApi.setSelectedRows([{ id: 1 }]);
expect(mockApi.getSelectedRows()).toHaveBeenCalled();
```

## 最佳实践

1. **每个测试专注单一功能**
2. **使用 describe/it 分组相关测试**
3. **测试边界条件**
4. **模拟外部依赖**
5. **保持测试独立性**
6. **使用有意义的测试名称**

## 持续集成

测试通过 GitHub Actions 自动运行：

- Node.js 18.x, 20.x, 22.x
- TypeScript 类型检查
- 单元测试
- 覆盖率报告上传到 Codecov
