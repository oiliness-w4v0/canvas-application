import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const canvas = sqliteTable('canvas', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    // 节点数据的 JSON 字符串
    nodes: text('nodes').notNull().$defaultFn(() => '[]'),
    // 边数据的 JSON 字符串
    edges: text('edges').notNull().$defaultFn(() => '[]'),
    // 画布状态：缩放比例、位置、主题等的 JSON 字符串
    canvasState: text('canvas_state').notNull().$defaultFn(() => '{}'),
});

export type CanvasSelect = typeof canvas.$inferSelect;
export type CanvasInsert = typeof canvas.$inferInsert;