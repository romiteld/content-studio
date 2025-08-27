const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Open SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'wealth_training.db'));

async function migrateTable(tableName, transformFn = null) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
      if (err) {
        console.error(`Error reading from ${tableName}:`, err);
        reject(err);
        return;
      }

      if (!rows || rows.length === 0) {
        console.log(`No data to migrate in ${tableName}`);
        resolve();
        return;
      }

      try {
        // Transform data if needed
        const dataToInsert = transformFn ? rows.map(transformFn) : rows;
        
        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < dataToInsert.length; i += batchSize) {
          const batch = dataToInsert.slice(i, i + batchSize);
          
          const { error } = await supabase
            .from(tableName)
            .insert(batch);
          
          if (error) {
            console.error(`Error inserting into ${tableName}:`, error);
            throw error;
          }
          
          console.log(`Migrated ${Math.min(i + batchSize, dataToInsert.length)}/${dataToInsert.length} rows to ${tableName}`);
        }
        
        console.log(`✅ Successfully migrated ${tableName}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function migrate() {
  console.log('Starting migration from SQLite to Supabase...\n');
  
  try {
    // Check if tables exist in SQLite before migrating
    const tables = [
      { name: 'content', transform: (row) => ({
        ...row,
        content_data: typeof row.content_data === 'string' ? JSON.parse(row.content_data) : row.content_data,
        chart_data: row.chart_data ? (typeof row.chart_data === 'string' ? JSON.parse(row.chart_data) : row.chart_data) : null
      })},
      { name: 'templates' },
      { name: 'uploads', transform: (row) => ({
        ...row,
        processed_content: row.processed_content ? (typeof row.processed_content === 'string' ? JSON.parse(row.processed_content) : row.processed_content) : null
      })},
      { name: 'generated_documents' },
      { name: 'charts', transform: (row) => ({
        ...row,
        data_points: typeof row.data_points === 'string' ? JSON.parse(row.data_points) : row.data_points,
        labels: row.labels ? (typeof row.labels === 'string' ? JSON.parse(row.labels) : row.labels) : null
      })},
      { name: 'brand_protection_log' },
      { name: 'content_calendar' },
      { name: 'partner_firms' },
      { name: 'agent_tasks', transform: (row) => ({
        ...row,
        input_data: row.input_data ? (typeof row.input_data === 'string' ? JSON.parse(row.input_data) : row.input_data) : null,
        output_data: row.output_data ? (typeof row.output_data === 'string' ? JSON.parse(row.output_data) : row.output_data) : null
      })},
      { name: 'engagement_metrics' },
      { name: 'talent_market_data' },
      { name: 'linkedin_templates', transform: (row) => ({
        ...row,
        variables: row.variables ? (typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables) : null
      })},
      { name: 'content_campaigns', transform: (row) => ({
        ...row,
        goals: row.goals ? (typeof row.goals === 'string' ? JSON.parse(row.goals) : row.goals) : null
      })},
      { name: 'compliance_rules' },
      { name: 'partner_features' },
      { name: 'campaigns', transform: (row) => ({
        ...row,
        id: undefined, // Let Supabase generate UUID
        channels: row.channels ? (typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels) : null,
        metrics: row.metrics ? (typeof row.metrics === 'string' ? JSON.parse(row.metrics) : row.metrics) : null
      })},
      { name: 'campaign_content', transform: (row) => ({
        ...row,
        id: undefined, // Let Supabase generate UUID
        media_urls: row.media_urls ? (typeof row.media_urls === 'string' ? JSON.parse(row.media_urls) : row.media_urls) : null,
        performance_metrics: row.performance_metrics ? (typeof row.performance_metrics === 'string' ? JSON.parse(row.performance_metrics) : row.performance_metrics) : null
      })},
      { name: 'partners', transform: (row) => ({
        ...row,
        id: undefined, // Let Supabase generate UUID
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : null
      })}
    ];
    
    // Check which tables exist in SQLite
    for (const table of tables) {
      await new Promise((resolve) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table.name], async (err, row) => {
          if (row) {
            console.log(`Migrating table: ${table.name}`);
            try {
              await migrateTable(table.name, table.transform);
            } catch (error) {
              console.error(`Failed to migrate ${table.name}:`, error);
            }
          } else {
            console.log(`Table ${table.name} does not exist in SQLite, skipping...`);
          }
          resolve();
        });
      });
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update backend code to use Supabase client instead of SQLite');
    console.log('2. Test all endpoints with Supabase');
    console.log('3. Remove SQLite dependencies from package.json');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
}

// Run migration
migrate();