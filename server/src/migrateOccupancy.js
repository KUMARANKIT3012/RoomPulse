import fs from 'node:fs/promises';
import { pool, query } from './config/db.js';

try {
  const migration = await fs.readFile(new URL('../sql/migrations/001_add_occupancy_counters.sql', import.meta.url), 'utf8');
  await query(migration);

  const { rows: columns } = await query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'occupancy'
      AND column_name IN ('entered_count', 'exited_count')
    ORDER BY column_name`);
  const { rows: occupancy } = await query(`
    SELECT COUNT(*)::int AS total_rows,
      COUNT(*) FILTER (WHERE entered_count IS NULL OR exited_count IS NULL)::int AS invalid_rows
    FROM occupancy`);

  console.log(JSON.stringify({ columns, occupancy: occupancy[0] }, null, 2));
} finally {
  await pool.end();
}
