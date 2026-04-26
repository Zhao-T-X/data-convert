const fs = require('fs')

window.preload = {
  readFile: (filePath) => {
    return fs.readFileSync(filePath, 'utf-8')
  },
  readFileBuffer: (filePath) => {
    return fs.readFileSync(filePath)
  }
}