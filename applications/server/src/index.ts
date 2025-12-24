import { Elysia, t } from "elysia";
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { db, sqlite } from "./database/index";
import { canvas } from './database/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from './common';
import { fetchWebMetadata } from './utils/metadata';
import { downloadMetadataImages } from './utils/images';
import { createUrlNode, parseCanvasNodes, stringifyCanvasNodes, type CanvasNode } from './types';

// 确保 uploads 目录存在
const uploadDir = join(process.cwd(), 'uploads', 'images');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: join(process.cwd(), 'uploads'),
    prefix: '/uploads',
  }))
  .get("/api/canvas", () => {
    try {
      const result = db.select().from(canvas).limit(1).get();

      if (!result) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Canvas not found');
      }

      return successResponse(result);
    } catch (error) {
      console.error('Error fetching canvas:', error);
      return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch canvas');
    }
  })
  .post("/api/canvas", async ({ body }) => {
    try {
      const data = db.insert(canvas).values({
        nodes: body.nodes,
        edges: body.edges,
        canvasState: body.canvasState
      }).returning().get();

      return successResponse(data);
    } catch (error) {
      console.error('Error creating canvas:', error);
      return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create canvas');
    }
  }, {
    body: t.Object({
      nodes: t.String(),
      edges: t.String(),
      canvasState: t.String()
    })
  })
  .post("/api/space/save", async ({ body }) => {
    try {
      const { url } = body;

      if (!url) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, 'URL is required');
      }

      // 获取元数据
      const metadata = await fetchWebMetadata(url);

      // 下载图片
      const { imagePath, iconPath } = await downloadMetadataImages(
        metadata.imageUrl,
        metadata.iconUrl
      );

      // 创建节点
      const newNode = createUrlNode(url, {
        title: metadata.title,
        description: metadata.description,
        imageUrl: imagePath,
        iconUrl: iconPath,
      });

      // 获取当前的 canvas
      let currentCanvas = db.select().from(canvas).limit(1).get();

      // 如果不存在 canvas，创建一个
      if (!currentCanvas) {
        const created = db.insert(canvas).values({
          nodes: '[]',
          edges: '[]',
          canvasState: '{}'
        }).returning().get();
        currentCanvas = created!;
      }

      // 解析现有节点并添加新节点
      const existingNodes = parseCanvasNodes(currentCanvas.nodes);

      // 检查是否已存在相同 URL 的节点
      const urlExists = existingNodes.some(
        node => node.type === 'url' && node.data.url === url
      );

      if (urlExists) {
        return successResponse({
          message: 'URL already saved',
        });
      }

      existingNodes.push(newNode);

      // 更新 canvas
      db.update(canvas)
        .set({ nodes: stringifyCanvasNodes(existingNodes) })
        .where(eq(canvas.id, currentCanvas.id))
        .execute();

      return successResponse({
        message: 'Saved to space successfully',
        node: newNode
      });
    } catch (error) {
      console.error('Error saving to space:', error);
      return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to save to space');
    }
  }, {
    body: t.Object({
      url: t.String()
    })
  })
  .put("/api/canvas/:id", async ({ params, body }) => {
    try {
      const id = Number(params.id);

      if (isNaN(id)) {
        return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid canvas ID');
      }

      // 先检查记录是否存在
      const existing = db.select().from(canvas).where(eq(canvas.id, id)).get();

      if (!existing) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Canvas not found');
      }

      // 更新记录
      const result = db.update(canvas).set({
        nodes: body.nodes,
        edges: body.edges,
        canvasState: body.canvasState
      }).where(eq(canvas.id, id)).returning().get();

      return successResponse(result);
    } catch (error) {
      console.error('Error updating canvas:', error);
      return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update canvas');
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      nodes: t.String(),
      edges: t.String(),
      canvasState: t.String()
    })
  })
  .get("/", () => "Hello Elysia");

// 导出 app 实例和类型供测试和 Eden 使用
export default app;
export type App = typeof app;
