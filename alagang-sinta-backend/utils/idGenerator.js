// utils/idGenerator.js
const supabase = require('../supabaseClient');

async function generateCustomId(tableName, columnName, prefix) {
  const { data, error } = await supabase
    .from(tableName)
    .select(columnName)
    .order(columnName, { ascending: false })
    .limit(1);

  if (error) {
    console.error('ID Generation error:', error.message);
    throw new Error('Unable to generate ID');
  }

  const lastId = data[0]?.[columnName] || `${prefix}-00000`;
  const numeric = parseInt(lastId.split('-')[1], 10);
  const nextId = `${prefix}-${String(numeric + 1).padStart(5, '0')}`;

  return nextId;
}

module.exports = { generateCustomId };
