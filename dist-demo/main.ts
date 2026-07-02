import { createApp } from 'vue';
import Demo from './Demo.vue';

// DB Grid CSS is loaded via CDN in index.html for demo
// In production, you would install db-grid and import:
// import 'db-grid/dist/db-grid.css';

const app = createApp(Demo);
app.mount('#app');
