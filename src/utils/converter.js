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
  // Lightweight YAML serializer (no external dependency) for smoke testing
  const dump = (val, depth) => {
    const pad = '  '.repeat(depth)
    if (Array.isArray(val)) {
      return val.map(v => `${pad}- ${dump(v, depth + 1)}`).join('\n')
    } else if (val && typeof val === 'object') {
      const lines = Object.entries(val).map(([k, v]) => {
        if (v && typeof v === 'object') {
          return `${pad}${k}:\n${dump(v, depth + 1)}`
        } else {
          return `${pad}${k}: ${String(v)}`
        }
      })
      return lines.join('\n')
    } else {
      return String(val)
    }
  }
  return dump(data, 0)
}
