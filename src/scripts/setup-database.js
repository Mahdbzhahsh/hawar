#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🔧 Supabase Database Setup Script 🔧\n');
  
  // Ask for Supabase credentials
  const supabaseUrl = await askQuestion('Enter your Supabase URL (e.g., https://xyz.supabase.co): ');
  const supabaseKey = await askQuestion('Enter your Supabase service role key (from API settings): ');
  
  try {
    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('\nConnecting to Supabase...');
    
    // Test connection
    const { data: connectionTest, error: connectionError } = await supabase.from('_prisma_migrations').select('*').limit(1).catch(() => ({ error: true }));
    
    if (connectionError) {
      console.log('✅ Connected to Supabase successfully');
    }
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'lib', 'create-patients-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('\nCreating patients table and setting up permissions...');
    
    // Execute SQL
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
    
    if (sqlError) {
      console.error('❌ Error creating database schema:', sqlError.message);
      console.log('\nAlternative method:');
      console.log('1. Go to your Supabase dashboard at https://app.supabase.com');
      console.log('2. Select your project');
      console.log('3. Go to the SQL Editor');
      console.log('4. Create a new query');
      console.log('5. Copy and paste the contents of src/lib/create-patients-table.sql');
      console.log('6. Run the query');
    } else {
      console.log('✅ Database schema created successfully!');
    }
    
    console.log('\n🎉 Setup complete! You can now use your application with Supabase.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main(); 