import { sqlite } from './index';

export async function initDatabase() {
  // 创建 canvas 表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS canvas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nodes TEXT NOT NULL DEFAULT '[]',
      edges TEXT NOT NULL DEFAULT '[]',
      canvas_state TEXT NOT NULL DEFAULT '{}'
    )
  `);

  console.log('Database initialized successfully');
}
