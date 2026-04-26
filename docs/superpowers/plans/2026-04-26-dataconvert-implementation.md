# DataConvert Implementation Plan

**Goal:** 构建一个 utools 数据转换插件，支持 Excel/CSV/JSON 转换为 JSON/SQL/CSV/YAML 格式

**Architecture:** 使用 Vue 3 + Vite 开发前端界面，通过 preload.js 调用 Node.js 进行文件解析。核心转换逻辑在前端纯 JS 实现，支持 10 万行数据。

**Tech Stack:** Vue 3 + Vite, xlsx (Node.js), js-yaml, plugin.json

---

## 文件结构

```
dataconvert/
├── public/
│   ├── plugin.json      # utools 插件配置
│   └── preload.js      # Node.js 能力（文件读写）
├── src/
│   ├── App.vue         # 主界面
│   └── utils/
│       └── converter.js # 转换逻辑
├── index.html
├── package.json
└── vite.config.js
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `public/plugin.json`
- Create: `public/preload.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "dataconvert",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "xlsx": "^0.18.5",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './'
})
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DataConvert</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建 public/plugin.json**

```json
{
  "name": "dataconvert",
  "pluginName": "DataConvert",
  "description": "数据格式转换工具",
  "version": "1.0.0",
  "main": "index.html",
  "preload": "preload.js",
  "features": [
    {
      "code": "dataconvert",
      "explain": "数据格式转换"
    }
  ]
}
```

- [ ] **Step 5: 创建 public/preload.js**

```js
const fs = require('fs')

window.preload = {
  readFile: (filePath) => {
    return fs.readFileSync(filePath, 'utf-8')
  },
  readFileBuffer: (filePath) => {
    return fs.readFileSync(filePath)
  }
}
```

- [ ] **Step 6: 安装依赖并测试**

```bash
npm install
npm run dev
```

---

## Task 2: 主界面组件

**Files:**
- Create: `src/main.js`
- Create: `src/App.vue`

- [ ] **Step 1: 创建 src/main.js**

```js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 2: 创建 src/App.vue**

```vue
<template>
  <div class="container">
    <h3>🔄 数据转换</h3>
    
    <div class="select-row">
      <span>转换为</span>
      <select v-model="outputFormat">
        <option value="json">JSON</option>
        <option value="sql">SQL INSERT</option>
        <option value="csv">CSV</option>
        <option value="yaml">YAML</option>
      </select>
    </div>
    
    <div class="drop-zone" @paste="handlePaste" @dragover.prevent @drop.prevent="handleDrop">
      <p>📋 粘贴数据或拖入文件</p>
      <p class="hint">.xlsx .xls .csv .json</p>
    </div>
    
    <div class="preview">
      <pre>{{ output }}</pre>
    </div>
    
    <button class="btn-copy" @click="copyResult" :disabled="!output">📋 复制结果</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toJSON, toSQL, toCSV, toYAML } from './utils/converter.js'

const outputFormat = ref('json')
const output = ref('')
const inputData = ref(null)

const handlePaste = (e) => {
  const text = e.clipboardData.getData('text')
  if (text) {
    inputData.value = text
    convert()
  }
}

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) {
    // 文件处理后续实现
  }
}

const convert = () => {
  if (!inputData.value) return
  
  try {
    const data = JSON.parse(inputData.value)
    switch (outputFormat.value) {
      case 'json':
        output.value = JSON.stringify(data, null, 2)
        break
      case 'sql':
        output.value = toSQL(data)
        break
      case 'csv':
        output.value = toCSV(data)
        break
      case 'yaml':
        output.value = toYAML(data)
        break
    }
  } catch (e) {
    output.value = '解析错误: ' + e.message
  }
}

const copyResult = () => {
  navigator.clipboard.writeText(output.value)
}
</script>

<style scoped>
.container {
  padding: 16px;
  font-family: -apple-system, sans-serif;
}
.select-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}
select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 12px;
  cursor: pointer;
}
.drop-zone .hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.preview {
  background: #1a1a2e;
  border-radius: 8px;
  padding: 12px;
  max-height: 200px;
  overflow: auto;
  margin-bottom: 12px;
}
.preview pre {
  color: #4fc3f7;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
}
.btn-copy {
  width: 100%;
  padding: 14px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
}
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 3: 测试界面**

```bash
npm run dev
```

---

## Task 3: 转换逻辑

**Files:**
- Create: `src/utils/converter.js`

- [ ] **Step 1: 创建 converter.js**

```js
export function toJSON(data) {
  if (Array.isArray(data)) {
    return JSON.stringify(data, null, 2)
  }
  return JSON.stringify([data], null, 2)
}

export function toSQL(data, tableName = 'data') {
  if (!Array.isArray(data)) {
    data = [data]
  }
  if (data.length === 0) return ''
  
  const columns = Object.keys(data[0])
  const values = data.map(row => {
    return '(' + columns.map(col => {
      const val = row[col]
      if (val === null || val === undefined) return 'NULL'
      if (typeof val === 'number') return val
      return `'${String(val).replace(/'/g, "''")}'`
    }).join(', ') + ')'
  }).join(',\n')
  
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${values};`
}

export function toCSV(data) {
  if (!Array.isArray(data)) {
    data = [data]
  }
  if (data.length === 0) return ''
  
  const columns = Object.keys(data[0])
  const lines = [columns.join(',')]
  
  data.forEach(row => {
    const values = columns.map(col => {
      const val = row[col]
      if (val === null || val === undefined) return ''
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    lines.push(values.join(','))
  })
  
  return lines.join('\n')
}

export function toYAML(data) {
  // 简单的 YAML 序列化
  const yaml = require('js-yaml')
  return yaml.dump(data, { indent: 2 })
}
```

- [ ] **Step 2: 提交**

```bash
git add src/utils/converter.js
git commit -m "feat: add conversion utilities"
```

---

## Task 4: 文件拖入支持

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 添加文件读取逻辑**

在 App.vue 的 script 中添加：

```js
import * as XLSX from 'xlsx'

const handleDrop = async (e) => {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (!file) return
  
  const ext = file.name.split('.').pop().toLowerCase()
  
  if (ext === 'json') {
    const text = await file.text()
    inputData.value = text
  } else if (ext === 'csv') {
    const text = await file.text()
    inputData.value = csvToJSON(text)
  } else if (['xlsx', 'xls'].includes(ext)) {
    const buffer = await file.arrayBuffer()
    inputData.value = excelToJSON(buffer)
  }
  
  convert()
}
```

- [ ] **Step 2: 添加辅助函数**

```js
function csvToJSON(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  const data = lines.slice(1).map(line => {
    const values = line.split(',')
    const row = {}
    headers.forEach((h, i) => {
      row[h] = values[i] || ''
    })
    return row
  })
  return JSON.stringify(data)
}

function excelToJSON(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(firstSheet)
  return JSON.stringify(data)
}
```

- [ ] **Step 3: 提交**

```bash
git add src/App.vue
git commit -m "feat: add file drop support"
```

---

## Task 5: 性能优化

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 添加大数据处理**

```js
const convert = () => {
  if (!inputData.value) return
  
  try {
    const data = JSON.parse(inputData.value)
    
    if (data.length > 10000) {
      // 分批处理
      output.value = '处理中...'
      setTimeout(() => {
        output.value = convertData(data)
      }, 10)
    } else {
      output.value = convertData(data)
    }
  } catch (e) {
    output.value = '解析错误: ' + e.message
  }
}

const convertData = (data) => {
  switch (outputFormat.value) {
    case 'json': return toJSON(data)
    case 'sql': return toSQL(data)
    case 'csv': return toCSV(data)
    case 'yaml': return toYAML(data)
    default: return ''
  }
}
```

- [ ] **Step 2: 提交**

```bash
git commit -m "perf: optimize for large data processing"
```

---

## Task 6: 打包配置

**Files:**
- Modify: `vite.config.js`
- Modify: `public/plugin.json`

- [ ] **Step 1: 更新 vite 配置**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

- [ ] **Step 2: 打包**

```bash
npm run build
```

- [ ] **Step 3: 提交**

```bash
git add dist/
git commit -m "build: add production build"
```

---

## 自检清单

- [ ] 所有任务完成
- [ ] npm install 成功
- [ ] npm run dev 能启动
- [ ] 文件拖入功能正常
- [ ] 四种格式转换正常
- [ ] 复制功能正常
- [ ] package.json, vite.config.js, plugin.json 配置正确