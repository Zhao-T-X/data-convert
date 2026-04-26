import { toJSON, toSQL, toCSV, toYAML } from '../../src/utils/converter.js'

const data = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

console.log('JSON:');
console.log(toJSON(data));

console.log('\nSQL:');
console.log(toSQL(data));

console.log('\nCSV:');
console.log(toCSV(data));

console.log('\nYAML:');
console.log(toYAML(data));
