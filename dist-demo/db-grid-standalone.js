// db-grid Web Component - 轻量级版本，无外部依赖
// 自带完整样式和图标

class DbGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['row-data', 'column-defs'];
  }

  constructor() {
    super();
    this._gridApi = null;
    this._rowData = [];
    this._columnDefs = [];
    this._sortField = null;
    this._sortDir = null;
    this._currentPage = 1;
    this._pageSize = 10;
    this._selectedRows = new Set();
  }

  connectedCallback() {
    this.render();
    this.loadStyles();
    this._initialized = true;
    // 如果数据在 component 定义前就设置好了，这里补渲染
    if (this._rowData.length > 0 || this._columnDefs.length > 0) {
      this.renderTable();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'row-data') {
      try { this._rowData = JSON.parse(newValue || '[]'); this.renderTable(); } catch (e) {}
    }
    if (name === 'column-defs') {
      try { this._columnDefs = JSON.parse(newValue || '[]'); this.renderTable(); } catch (e) {}
    }
  }

  loadStyles() {
    if (document.getElementById('db-grid-styles')) return;
    const style = document.createElement('style');
    style.id = 'db-grid-styles';
    style.textContent = `
      .db-grid { width: 100%; height: 100%; min-height: 400px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #333; box-sizing: border-box; display: flex; flex-direction: column; }
      .db-grid-header { display: flex; background: #f8f9fa; border-bottom: 2px solid #e9ecef; font-weight: 600; color: #495057; }
      .db-grid-header-cell { padding: 12px 16px; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px; transition: background 0.15s; }
      .db-grid-header-cell:hover { background: #e9ecef; }
      .db-grid-header-cell.sorted { color: #2196f3; }
      .db-grid-body { overflow-y: auto; flex: 1; min-height: 0; }
      .db-grid-row { display: flex; border-bottom: 1px solid #eee; transition: background 0.1s; }
      .db-grid-row:hover { background: #f0f7ff; }
      .db-grid-row.selected { background: #e3f2fd; }
      .db-grid-cell { padding: 10px 16px; display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .db-grid-checkbox { width: 40px; justify-content: center; }
      .db-grid-checkbox input { width: 16px; height: 16px; cursor: pointer; accent-color: #2196f3; }
      .db-grid-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #f8f9fa; border-top: 1px solid #e9ecef; }
      .db-grid-info { color: #6c757d; font-size: 13px; }
      .db-grid-pagination { display: flex; gap: 4px; }
      .db-grid-page-btn { padding: 4px 10px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.15s; }
      .db-grid-page-btn:hover:not(:disabled) { background: #e9ecef; border-color: #adb5bd; }
      .db-grid-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .db-grid-page-btn.active { background: #2196f3; color: white; border-color: #2196f3; }
      .sort-icon { font-size: 10px; opacity: 0.5; }
      .sort-icon.active { opacity: 1; }
      .filter-icon { font-size: 11px; margin-left: auto; }
    `;
    document.head.appendChild(style);
  }

  render() {
    this.innerHTML = `
      <div class="db-grid">
        <div class="db-grid-header"></div>
        <div class="db-grid-body"></div>
        <div class="db-grid-footer">
          <div class="db-grid-info">共 <span class="total-count">0</span> 条</div>
          <div class="db-grid-pagination"></div>
        </div>
      </div>
    `;
    this.renderTable();
  }

  renderTable() {
    const header = this.querySelector('.db-grid-header');
    const body = this.querySelector('.db-grid-body');
    if (!header || !body) return; // DOM 还没准备好就跳过
    
    // 渲染表头
    header.innerHTML = '';
    this._columnDefs.forEach(col => {
      const isSorted = this._sortField === col.field;
      const th = document.createElement('div');
      th.className = 'db-grid-header-cell' + (isSorted ? ' sorted' : '');
      th.style.width = col.width ? `${col.width}px` : '150px';
      th.style.flex = col.width ? 'none' : '1';
      th.innerHTML = `
        ${col.checkboxSelection ? '<input type="checkbox" style="width:16px;height:16px;cursor:pointer;accent-color:#2196f3;">' : ''}
        <span>${col.headerName || col.field}</span>
        ${col.sortable !== false ? `<span class="sort-icon ${isSorted ? 'active' : ''}">${isSorted ? (this._sortDir === 'asc' ? '▲' : '▼') : '▼'}</span>` : ''}
      `;
      th.onclick = () => this.handleSort(col.field);
      header.appendChild(th);
    });

    // 排序和分页
    let data = [...this._rowData];
    if (this._sortField) {
      data.sort((a, b) => {
        const va = a[this._sortField], vb = b[this._sortField];
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return this._sortDir === 'desc' ? -cmp : cmp;
      });
    }
    const total = data.length;
    const start = (this._currentPage - 1) * this._pageSize;
    const pageData = data.slice(start, start + this._pageSize);

    // 渲染行
    body.innerHTML = '';
    pageData.forEach((row, idx) => {
      const tr = document.createElement('div');
      tr.className = 'db-grid-row' + (this._selectedRows.has(start + idx) ? ' selected' : '');
      tr.dataset.index = start + idx;
      this._columnDefs.forEach(col => {
        const td = document.createElement('div');
        td.className = 'db-grid-cell' + (col.checkboxSelection ? ' db-grid-checkbox' : '');
        td.style.width = col.width ? `${col.width}px` : '150px';
        td.style.flex = col.width ? 'none' : '1';
        if (col.checkboxSelection) {
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = this._selectedRows.has(start + idx);
          cb.onchange = () => this.toggleRow(start + idx, cb.checked, row);
          td.appendChild(cb);
        } else if (col.cellRenderer) {
          td.textContent = col.cellRenderer({ value: row[col.field], data: row });
        } else if (col.valueFormatter) {
          td.textContent = col.valueFormatter({ value: row[col.field], data: row });
        } else {
          td.textContent = row[col.field] ?? '';
        }
        tr.appendChild(td);
      });
      tr.onclick = (e) => { if (e.target.type !== 'checkbox') this.selectRow(start + idx); };
      body.appendChild(tr);
    });

    // 更新分页
    this.querySelector('.total-count').textContent = total;
    this.renderPagination(total);
  }

  renderPagination(total) {
    const pagination = this.querySelector('.db-grid-pagination');
    const totalPages = Math.ceil(total / this._pageSize) || 1;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this._currentPage - 1 && i <= this._currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    pagination.innerHTML = `
      <button class="db-grid-page-btn" ${this._currentPage === 1 ? 'disabled' : ''} onclick="this.getRootNode().host.prevPage()">«</button>
      ${pages.map(p => p === '...' ? '<span style="padding:4px 8px;color:#999;">...</span>' : 
        `<button class="db-grid-page-btn ${p === this._currentPage ? 'active' : ''}" onclick="this.getRootNode().host.goToPage(${p})">${p}</button>`).join('')}
      <button class="db-grid-page-btn" ${this._currentPage === totalPages ? 'disabled' : ''} onclick="this.getRootNode().host.nextPage()">»</button>
    `;
  }

  handleSort(field) {
    if (this._sortField === field) {
      this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this._sortField = field;
      this._sortDir = 'asc';
    }
    this._currentPage = 1;
    this.renderTable();
  }

  selectRow(idx) {
    const row = this.querySelector(`.db-grid-row[data-index="${idx}"]`);
    if (row) row.classList.toggle('selected');
    if (this._selectedRows.has(idx)) {
      this._selectedRows.delete(idx);
    } else {
      this._selectedRows.add(idx);
    }
  }

  toggleRow(idx, checked, row) {
    if (checked) {
      this._selectedRows.add(idx);
      this.querySelector(`.db-grid-row[data-index="${idx}"]`)?.classList.add('selected');
    } else {
      this._selectedRows.delete(idx);
      this.querySelector(`.db-grid-row[data-index="${idx}"]`)?.classList.remove('selected');
    }
  }

  goToPage(page) { this._currentPage = page; this.renderTable(); }
  prevPage() { if (this._currentPage > 1) { this._currentPage--; this.renderTable(); } }
  nextPage() { 
    const totalPages = Math.ceil(this._rowData.length / this._pageSize) || 1;
    if (this._currentPage < totalPages) { this._currentPage++; this.renderTable(); }
  }

  // JavaScript API
  set rowData(data) { this._rowData = data || []; this._currentPage = 1; if (this._initialized) this.renderTable(); }
  get rowData() { return this._rowData; }
  set columnDefs(cols) { this._columnDefs = cols || []; if (this._initialized) this.renderTable(); }
  get columnDefs() { return this._columnDefs; }

  exportToExcel(filename = 'export.xlsx') {
    const ws = this._rowData.map(row => {
      const obj = {};
      this._columnDefs.forEach(col => { if (!col.checkboxSelection) obj[col.headerName || col.field] = row[col.field]; });
      return obj;
    });
    // 简单CSV导出
    if (ws.length === 0) return;
    const headers = Object.keys(ws[0]);
    const csv = [headers.join(','), ...ws.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace('.xlsx', '.csv');
    link.click();
  }

  refreshData() { this.renderTable(); }
  resetState() { this._sortField = null; this._sortDir = null; this._currentPage = 1; this._selectedRows.clear(); this.renderTable(); }
}

customElements.define('db-grid-element', DbGridElement);
console.log('db-grid-element registered successfully');
