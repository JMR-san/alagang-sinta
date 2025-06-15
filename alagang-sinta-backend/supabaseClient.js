//for database queries
const {createClient} = require('@supabase/supabase-js');

const supabaseUrl = 'https://bilyuymilatjhdfuerkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHl1eW1pbGF0amhkZnVlcmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTU4ODYsImV4cCI6MjA2NDYzMTg4Nn0.79Kl1ubGXdS1TVestMYm9iahpqDqpmJhwbfUqcZU5Rs';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;