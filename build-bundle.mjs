// 手动合并所有 chunks 为单个 IIFE 文件
import { readFileSync, writeFileSync } from 'fs';

const distPath = '/home/node/.openclaw/workspace/db-grid/dist/db-grid-elements/browser';

const chunks = {
  'chunk-FK6H3RFT': readFileSync(distPath + '/chunk-FK6H3RFT.js', 'utf8'),
  'chunk-5RVQ7557': readFileSync(distPath + '/chunk-5RVQ7557.js', 'utf8'),
  'chunk-BOYL57GH': readFileSync(distPath + '/chunk-BOYL57GH.js', 'utf8'),
  'chunk-GXAQDK3Q': readFileSync(distPath + '/chunk-GXAQDK3Q.js', 'utf8'),
  'chunk-NUHLIM3N': readFileSync(distPath + '/chunk-NUHLIM3N.js', 'utf8'),
  'chunk-TQPZRHFO': readFileSync(distPath + '/chunk-TQPZRHFO.js', 'utf8'),
  'chunk-UIJ6C4PS': readFileSync(distPath + '/chunk-UIJ6C4PS.js', 'utf8'),
  'chunk-UPHFQ2NC': readFileSync(distPath + '/chunk-UPHFQ2NC.js', 'utf8'),
  'main': readFileSync(distPath + '/main-YMLMMD3B.js', 'utf8'),
};

// 创建内联模块加载器
let bundle = `(function() {
  var __modules = {};
  var __loaded = {};
  
  function __require(name) {
    if (__loaded[name]) return __modules[name];
    __loaded[name] = true;
    var mod = { exports: {} };
    var factory = __modules[name];
    factory(mod, mod.exports);
    return mod.exports;
  }
`;

// 添加 chunk-FK6H3RFT (最小的，先添加)
bundle += `
  __modules['chunk-FK6H3RFT'] = function(module, exports) {
    ${chunks['chunk-FK6H3RFT'].replace(/^export\s*\{[^}]*\}\s*;/m, '').trim()}
  };
`;

// 添加其他 chunks
const chunkOrder = ['chunk-5RVQ7557', 'chunk-BOYL57GH', 'chunk-GXAQDK3Q', 'chunk-NUHLIM3N', 'chunk-TQPZRHFO', 'chunk-UIJ6C4PS', 'chunk-UPHFQ2NC'];
for (const name of chunkOrder) {
  const code = chunks[name]
    .replace(/^import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '')
    .replace(/^import\s*['"][^'"]+['"]\s*;?\s*/gm, '');
  bundle += `
  __modules['${name}'] = function(module, exports) {
    ${code.trim()}
  };
`;
}

// 添加主模块
const mainCode = chunks['main']
  .replace(/^import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"]\s*;?\s*/gm, '')
  .replace(/^import\s*['"][^'"]+['"]\s*;?\s*/gm, '');
bundle += `
  __modules['main'] = function(module, exports) {
    ${mainCode.trim()}
  };
`;

// 启动主模块
bundle += `
  __require('main');
})();
`;

writeFileSync('./dist-demo/db-grid-elements-bundled.js', bundle);
console.log('Bundle created, size:', bundle.length);
