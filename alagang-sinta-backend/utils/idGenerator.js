// utils/idGenerator.js
const supabase = require('../supabaseClient');

async function fetchLastId(tableName, columnName) {
  console.log('Fetching last ID for:', { tableName, columnName }); // Debug log
  
  const { data, error } = await supabase
    .from(tableName)
    .select(columnName)
    .order(columnName, { ascending: false })
    .limit(1);

  if (error) {
    console.error('ID fetch error:', error.message);
    throw new Error(`Unable to fetch last ID: ${error.message}`);
  }

  console.log('Last ID data:', data); // Debug log
  return data[0]?.[columnName] || null;
}

function generateNextId(lastId, prefix, digits = 4) {
  console.log('Generating next ID from:', { lastId, prefix, digits }); // Debug log
  
  // Ensure prefix doesn't end with a hyphen
  const cleanPrefix = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
  
  if (!lastId) {
    console.log('No last ID found, generating first ID'); // Debug log
    const firstId = `${cleanPrefix}0001`;
    console.log('Generated first ID:', firstId, 'Length:', firstId.length);
    return firstId;
  }
  
  // Extract numeric part from the last ID (after the prefix)
  const numeric = parseInt(lastId.substring(cleanPrefix.length), 10);
  console.log('Extracted numeric part:', numeric);
  
  if (isNaN(numeric)) {
    console.error('Invalid last ID format:', lastId);
    throw new Error(`Invalid last ID format: ${lastId}`);
  }
  
  const nextId = `${cleanPrefix}${String(numeric + 1).padStart(digits, '0')}`;
  console.log('Generated next ID:', nextId, 'Length:', nextId.length);
  return nextId;
}

async function generateBatchIds(tableName, columnName, prefix, count, digits = 4) {
  console.log('Starting generateBatchIds with params:', { tableName, columnName, prefix, count, digits }); // Debug log
  
  try {
    const lastId = await fetchLastId(tableName, columnName);
    console.log('Last ID found:', lastId); // Debug log
    
    // Ensure prefix doesn't end with a hyphen
    const cleanPrefix = prefix.endsWith('-') ? prefix.slice(0, -1) : prefix;
    
    let lastNum = lastId ? parseInt(lastId.substring(cleanPrefix.length), 10) : 0;
    console.log('Parsed last number:', lastNum);
    
    if (isNaN(lastNum)) {
      console.error('Invalid last ID format:', lastId);
      throw new Error(`Invalid last ID format: ${lastId}`);
    }
    
    const ids = [];
    for (let i = 0; i < count; i++) {
      lastNum++;
      const newId = `${cleanPrefix}${String(lastNum).padStart(digits, '0')}`;
      console.log('Generated ID in batch:', newId, 'Length:', newId.length);
      ids.push(newId);
    }
    
    console.log('Final batch of generated IDs:', ids); // Debug log
    return ids;
  } catch (error) {
    console.error('Error in generateBatchIds:', error);
    throw error;
  }
}

module.exports = { fetchLastId, generateNextId, generateBatchIds };
