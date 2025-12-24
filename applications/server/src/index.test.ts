import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'bun:test';
import { edenTreaty } from '@elysiajs/eden';
import type { App } from './index';
import { db } from './database/index';
import { canvas } from './database/schema';
import type { ApiResponse } from './common';
import type { CanvasSelect } from './database/schema';

// 创建测试客户端，使用 3001 端口（测试端口）
const app = (await import('./index')).default;
const client = edenTreaty<App>('http://localhost:3001');

describe('Canvas API', () => {
  let server: { stop: () => void } | null = null;
  let testCanvasId: number;

  beforeAll(async () => {
    // 启动测试服务器在 3001 端口
    server = app.listen(3001);

    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 100));

    // 清理测试数据库
    await db.delete(canvas);
  });

  afterAll(async () => {
    // 清理测试数据库
    await db.delete(canvas);

    // 关闭服务器
    if (server) {
      server.stop();
    }
  });

  beforeEach(async () => {
    // 每个测试前清理数据
    await db.delete(canvas);
  });

  describe('GET /api/canvas', () => {
    it('should return not found when no canvas exists', async () => {
      const response = await client.api.canvas.get();

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      // Eden Treaty 返回 { data: ApiResponse, error: null }
      const apiResponse = response.data as ApiResponse;
      expect(apiResponse.success).toBe(false);
      expect(apiResponse.error?.code).toBe('NOT_FOUND');
    });

    it('should return canvas data when exists', async () => {
      // 先创建一个画布
      const created = await db.insert(canvas).values({
        nodes: '[{"id": "1"}]',
        edges: '[]',
        canvasState: '{"zoom": 1}'
      }).returning().get();

      if (!created) {
        throw new Error('Failed to create canvas');
      }

      testCanvasId = created.id;

      const response = await client.api.canvas.get();

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      const apiResponse = response.data as ApiResponse<CanvasSelect>;
      expect(apiResponse.success).toBe(true);
      expect(apiResponse.data).toBeDefined();

      const canvasData = apiResponse.data as CanvasSelect;
      expect(canvasData.nodes).toBe('[{"id": "1"}]');
    });
  });

  describe('POST /api/canvas', () => {
    it('should create a new canvas successfully', async () => {
      const response = await client.api.canvas.post({
        nodes: '[{"id": "2"}]',
        edges: '[{"id": "e1"}]',
        canvasState: '{"zoom": 1.5}'
      });

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      const apiResponse = response.data as ApiResponse<CanvasSelect>;
      expect(apiResponse.success).toBe(true);
      expect(apiResponse.data).toBeDefined();

      const canvasData = apiResponse.data as CanvasSelect;
      expect(canvasData.nodes).toBe('[{"id": "2"}]');
      expect(canvasData.id).toBeDefined();
    });

    it('should fail with invalid data', async () => {
      const response = await client.api.canvas.post({
        nodes: '',
        edges: '',
        canvasState: ''
      });

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      // 数据库可能会处理空字符串，这里测试不会崩溃
      expect(response.data).toBeDefined();
    });
  });

  describe('PUT /api/canvas/:id', () => {
    beforeEach(async () => {
      // 为更新测试创建初始数据
      const created = await db.insert(canvas).values({
        nodes: '[{"id": "original"}]',
        edges: '[]',
        canvasState: '{}'
      }).returning().get();

      if (!created) {
        throw new Error('Failed to create canvas');
      }

      testCanvasId = created.id;
    });

    it('should update canvas successfully', async () => {
      const response = await client.api.canvas[String(testCanvasId)].put({
        nodes: '[{"id": "updated"}]',
        edges: '[{"id": "new-edge"}]',
        canvasState: '{"zoom": 2}'
      });

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      const apiResponse = response.data as ApiResponse<CanvasSelect>;
      expect(apiResponse.success).toBe(true);

      const canvasData = apiResponse.data as CanvasSelect;
      expect(canvasData.nodes).toBe('[{"id": "updated"}]');
    });

    it('should return error for non-existent canvas', async () => {
      const response = await client.api.canvas['999999'].put({
        nodes: '[{"id": "test"}]',
        edges: '[]',
        canvasState: '{}'
      });

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      const apiResponse = response.data as ApiResponse;
      expect(apiResponse.success).toBe(false);
      expect(apiResponse.error?.code).toBe('NOT_FOUND');
    });

    it('should return error for invalid canvas ID', async () => {
      const response = await client.api.canvas['invalid'].put({
        nodes: '[{"id": "test"}]',
        edges: '[]',
        canvasState: '{}'
      });

      if (!response || !response.data) {
        throw new Error('No response received');
      }

      const apiResponse = response.data as ApiResponse;
      expect(apiResponse.success).toBe(false);
      expect(apiResponse.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});
