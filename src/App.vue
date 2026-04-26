<template>
  <div class="container">
    <h3>🔄 数据转换</h3>
    
    <div class="select-row">
      <span>转换为</span>
      <select v-model="outputFormat" @change="convert">
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
    
    <div class="preview" v-if="output">
      <pre>{{ output }}</pre>
    </div>
    
    <button class="btn-copy" @click="copyResult" :disabled="!output">📋 复制结果</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import yaml from 'js-yaml'
import { toJSON, toSQL, toCSV } from './utils/converter.js'

const outputFormat = ref('json')
const output = ref('')
const inputData = ref(null)

const handlePaste = (e) => {
  const text = e.clipboardData.getData('text')
  if (text) {
    try {
      inputData.value = JSON.parse(text)
      convert()
    } catch {
      // 非 JSON，按纯文本处理
      inputData.value = text
      output.value = '不支持的格式，请粘贴 JSON 数据或拖入文件'
    }
  }
}

const handleDrop = async (e) => {
  const file = e.dataTransfer.files[0]
  if (!file) return
  
  const ext = file.name.split('.').pop().toLowerCase()
  
  try {
    if (ext === 'json') {
      const text = await file.text()
      inputData.value = JSON.parse(text)
    } else if (ext === 'csv') {
      inputData.value = csvToJSON(await file.text())
    } else if (['xlsx', 'xls'].includes(ext)) {
      const buffer = await file.arrayBuffer()
      inputData.value = excelToJSON(buffer)
    } else {
      output.value = '不支持的文件格式'
      return
    }
    convert()
  } catch (err) {
    output.value = '读取文件失败: ' + err.message
  }
}

const csvToJSON = (text) => {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const row = {}
    headers.forEach((h, i) => {
      row[h] = values[i]?.trim() || ''
    })
    return row
  })
}

const excelToJSON = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(firstSheet)
}

const convert = () => {
  if (!inputData.value || Array.isArray(inputData.value) && inputData.value.length === 0) {
    output.value = ''
    return
  }
  
  try {
    const data = inputData.value
    
    if (data.length > 50000) {
      output.value = '数据量大，请稍候...\n'
      setTimeout(() => {
        output.value = doConvert(data)
      }, 50)
    } else {
      output.value = doConvert(data)
    }
  } catch (e) {
    output.value = '转换错误: ' + e.message
  }
}

const doConvert = (data) => {
  switch (outputFormat.value) {
    case 'json':
      return toJSON(data)
    case 'sql':
      return toSQL(data)
    case 'csv':
      return toCSV(data)
    case 'yaml':
      return yaml.dump(data, { indent: 2 })
    default:
      return ''
  }
}

const copyResult = () => {
  if (output.value) {
    navigator.clipboard.writeText(output.value)
    alert('已复制到剪贴板')
  }
}
</script>

<style scoped>
.container {
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
}
h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #333;
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
.select-row span {
  color: #666;
  font-size: 14px;
}
select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}
.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}
.drop-zone:hover {
  border-color: #4CAF50;
  background: #f6f9f2;
}
.drop-zone p {
  margin: 0;
  color: #666;
  font-size: 14px;
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
  max-height: 250px;
  overflow: auto;
  margin-bottom: 12px;
}
.preview pre {
  color: #4fc3f7;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
  font-family: 'SF Mono', 'Consolas', monospace;
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
  font-weight: 500;
}
.btn-copy:hover {
  background: #43a047;
}
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>