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
    // 加载 AG Grid CSS
    if (!document.querySelector('link[data-ag-grid-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/styles/ag-grid.css';
      link.setAttribute('data-ag-grid-css', 'true');
      document.head.appendChild(link);
      // 等待 CSS 加载
      await new Promise(resolve => link.onload = resolve);
    }
    
    // 加载 AG Grid JS
    if (typeof agGrid === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/dist/ag-grid-community.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
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
