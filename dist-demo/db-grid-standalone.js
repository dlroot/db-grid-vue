// db-grid Web Component - 独立版本
// 使用 AG Grid Community Edition，样式通过 Light DOM 加载

class DbGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['row-data', 'column-defs'];
  }

  constructor() {
    super();
    this._gridApi = null;
    this._rowData = [];
    this._columnDefs = [];
    this._initialized = false;
  }

  connectedCallback() {
    if (this._initialized) return;
    this._initialized = true;
    
    // 确保容器 div 存在
    if (!this.querySelector('.grid-container')) {
      const container = document.createElement('div');
      container.className = 'grid-container';
      this.appendChild(container);
    }
    
    // 加载 AG Grid JS 和 CSS
    this.loadAGGrid().then(() => this.createGrid());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._gridApi) return;
    
    if (name === 'row-data') {
      try {
        this._rowData = JSON.parse(newValue || '[]');
        this._gridApi.setGridOption('rowData', this._rowData);
      } catch (e) { console.error('Failed to parse row-data:', e); }
    }
    
    if (name === 'column-defs') {
      try {
        this._columnDefs = JSON.parse(newValue || '[]');
        this._gridApi.setGridOption('columnDefs', this._columnDefs);
      } catch (e) { console.error('Failed to parse column-defs:', e); }
    }
  }

  async loadAGGrid() {
    // 加载 AG Grid CSS + JS 全部资源（包含图标）
    if (!document.querySelector('link[data-ag-grid-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/styles/ag-grid.css';
      link.setAttribute('data-ag-grid-css', 'true');
      document.head.appendChild(link);
      // 等待 CSS 完全加载（包括背景图标的 fetch）
      await new Promise(resolve => { link.onload = resolve; link.onerror = resolve; });
    }
    
    if (typeof agGrid === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/dist/ag-grid-community.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    // 注入图标样式（SVG data URI）
    if (!document.getElementById('ag-grid-icons')) {
      const iconStyle = document.createElement('style');
      iconStyle.id = 'ag-grid-icons';
      iconStyle.textContent = `
        .ag-icon { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; }
        .ag-icon::before { content: ''; display: block; width: 16px; height: 16px; }
        .ag-icon-asc::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M8 4l5 6H3z'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-desc::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M8 12l5-6H3z'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-filter::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M1 3h14v2H1zm3 4h8v2H4zm2 4h4v2H6z'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-columns::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect fill='%23666' x='1' y='2' width='4' height='12' rx='1'/%3E%3Crect fill='%23666' x='6' y='2' width='4' height='12' rx='1'/%3E%3Crect fill='%23666' x='11' y='2' width='4' height='12' rx='1'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-menu::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle fill='%23666' cx='4' cy='4' r='1.5'/%3E%3Ccircle fill='%23666' cx='4' cy='8' r='1.5'/%3E%3Ccircle fill='%23666' cx='4' cy='12' r='1.5'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-checkbox-checked::before, .ag-icon-check::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect fill='%232196f3' width='16' height='16' rx='2'/%3E%3Cpath fill='white' d='M4 8l3 3 5-6'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-checkbox-unchecked::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect stroke='%23666' fill='white' width='16' height='16' rx='2'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-pagination-first::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M3 3h2v10H3zm8 0l-6 5 6 5V3z'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-pagination-last::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M11 3h2v10h-2zm-8 0l6 5-6 5V3z'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-pagination-prev::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M10 3l-6 5 6 5V3z'/%3E%3C/svg%3E") no-repeat center; }
        .ag-icon-pagination-next::before { background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M6 3l6 5-6 5V3z'/%3E%3C/svg%3E") no-repeat center; }
      `;
      document.head.appendChild(iconStyle);
    }
  }

  createGrid() {
    const container = this.querySelector('.grid-container');
    
    const gridOptions = {
      columnDefs: this._columnDefs,
      rowData: this._rowData,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
      },
      pagination: true,
      paginationPageSize: 10,
      onGridReady: (params) => {
        this._gridApi = params.api;
        console.log('db-grid-element initialized');
      },
    };

    agGrid.createGrid(container, gridOptions);
  }

  // JavaScript API
  set rowData(data) {
    this._rowData = data;
    if (this._gridApi) {
      this._gridApi.setGridOption('rowData', data);
    }
  }
  get rowData() { return this._rowData; }

  set columnDefs(cols) {
    this._columnDefs = cols;
    if (this._gridApi) {
      this._gridApi.setGridOption('columnDefs', cols);
    }
  }
  get columnDefs() { return this._columnDefs; }

  exportToExcel(filename = 'export.xlsx') {
    this._gridApi?.exportDataAsExcel({ fileName: filename });
  }
  refreshData() { this._gridApi?.refreshCells(); }
  resetState() {
    this._gridApi?.resetColumnState();
    this._gridApi?.setFilterModel(null);
  }
}

customElements.define('db-grid-element', DbGridElement);
console.log('db-grid-element registered successfully');
