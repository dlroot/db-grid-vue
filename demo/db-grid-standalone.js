// db-grid Web Component - 独立版本，不依赖 Angular
// 使用 AG Grid Community Edition

class DbGridElement extends HTMLElement {
  static get observedAttributes() {
    return ['row-data', 'column-defs'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._gridApi = null;
    this._rowData = [];
    this._columnDefs = [];
  }

  connectedCallback() {
    this.render();
    this.initGrid();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }
        .grid-container {
          width: 100%;
          height: 100%;
          min-height: 400px;
        }
      </style>
      <div class="grid-container"></div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'row-data' && this._gridApi) {
      try {
        const data = JSON.parse(newValue || '[]');
        this._rowData = data;
        this._gridApi.setGridOption('rowData', data);
      } catch (e) {
        console.error('Failed to parse row-data:', e);
      }
    }
    
    if (name === 'column-defs' && this._gridApi) {
      try {
        const cols = JSON.parse(newValue || '[]');
        this._columnDefs = cols;
        this._gridApi.setGridOption('columnDefs', cols);
      } catch (e) {
        console.error('Failed to parse column-defs:', e);
      }
    }
  }

  async initGrid() {
    // 等待 AG Grid 加载
    if (typeof agGrid === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/dist/ag-grid-community.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    // 将 AG Grid CSS 注入到 shadow DOM
    await this.injectAGGridStyles();
    
    this.createGrid();
  }
  
  async injectAGGridStyles() {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/ag-grid-community@31/styles/ag-grid.css');
      const css = await response.text();
      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
    } catch (e) {
      console.warn('Failed to load AG Grid CSS, using fallback styles:', e);
      // Fallback 基础样式
      const style = document.createElement('style');
      style.textContent = `
        .ag-theme-quartz { --ag-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .ag-root-wrapper { border: 1px solid #ddd; border-radius: 4px; }
        .ag-header { background: #f5f5f5; font-weight: 600; }
        .ag-row:hover { background: #f0f7ff; }
        .ag-cell { display: flex; align-items: center; }
      `;
      this.shadowRoot.appendChild(style);
    }
  }

  createGrid() {
    const container = this.shadowRoot.querySelector('.grid-container');
    
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

  get rowData() {
    return this._rowData;
  }

  set columnDefs(cols) {
    this._columnDefs = cols;
    if (this._gridApi) {
      this._gridApi.setGridOption('columnDefs', cols);
    }
  }

  get columnDefs() {
    return this._columnDefs;
  }

  exportToExcel(filename = 'export.xlsx') {
    if (this._gridApi) {
      this._gridApi.exportDataAsExcel({ fileName: filename });
    }
  }

  refreshData() {
    if (this._gridApi) {
      this._gridApi.refreshCells();
    }
  }

  resetState() {
    if (this._gridApi) {
      this._gridApi.resetColumnState();
      this._gridApi.setFilterModel(null);
    }
  }
}

// 注册 Web Component
customElements.define('db-grid-element', DbGridElement);
console.log('db-grid-element registered successfully');
