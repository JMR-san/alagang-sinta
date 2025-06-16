// utils/idGenerator.js
const supabase = require('../supabaseClient');

async function fetchLastId(tableName, columnName) {
  const { data, error } = await supabase
    .from(tableName)
    .select(columnName)
    .order(columnName, { ascending: false })
    .limit(1);

  if (error) {
    console.error('ID fetch error:', error.message);
    throw new Error('Unable to fetch last ID');
  }

  return data[0]?.[columnName] || null;
}

function generateNextId(lastId, prefix) {
  if (!lastId) return `${prefix}-00001`;
  const numeric = parseInt(lastId.split('-')[1], 10);
  return `${prefix}-${String(numeric + 1).padStart(5, '0')}`;
}

async function generateBatchIds(tableName, columnName, prefix, count) {
  const lastId = await fetchLastId(tableName, columnName);
  let lastNum = lastId ? parseInt(lastId.split('-')[1], 10) : 0;
  const ids = [];
  for (let i = 0; i < count; i++) {
    lastNum++;
    ids.push(`${prefix}-${String(lastNum).padStart(5, '0')}`);
  }
  return ids;
}

module.exports = { fetchLastId, generateNextId, generateBatchIds };
