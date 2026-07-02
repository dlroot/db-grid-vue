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

  async initGrid() {
    // 动态加载 AG Grid CSS
    if (!document.querySelector('link[href*="ag-grid"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/styles/ag-grid.css';
      document.head.appendChild(link);
    }
    
    // 动态加载 AG Grid JS
    if (typeof agGrid !== 'undefined') {
      this.createGrid();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31/dist/ag-grid-community.min.js';
      script.onload = () => this.createGrid();
      document.head.appendChild(script);
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
