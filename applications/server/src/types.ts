import { CanvasSelect } from './database/schema';

// Canvas 节点类型
export interface CanvasNode {
  id: string;
  type: 'url' | 'note' | 'folder';
  data: CanvasNodeData;
  position: {
    x: number;
    y: number;
  };
}

// URL 节点数据
export interface UrlNodeData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  icon?: string;
}

// 其他节点数据类型
export interface BaseNodeData {
  [key: string]: unknown;
}

export type CanvasNodeData = UrlNodeData | BaseNodeData;

// Canvas 边类型
export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// 类型守卫
export function isUrlNodeData(data: CanvasNodeData): data is UrlNodeData {
  return 'url' in data && typeof data.url === 'string';
}

// 创建 URL 节点
export function createUrlNode(
  url: string,
  metadata: {
    title: string;
    description?: string;
    imageUrl?: string;
    iconUrl?: string;
  }
): CanvasNode {
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'url',
    data: {
      url,
      title: metadata.title,
      description: metadata.description,
      image: metadata.imageUrl,
      icon: metadata.iconUrl,
    },
    position: {
      x: Math.random() * 500,
      y: Math.random() * 500,
    },
  };
}

// 解析 Canvas nodes
export function parseCanvasNodes(nodesJson: string): CanvasNode[] {
  try {
    const nodes = JSON.parse(nodesJson) as unknown[];
    return nodes.filter((node): node is CanvasNode => {
      return (
        typeof node === 'object' &&
        node !== null &&
        'id' in node &&
        'type' in node &&
        'data' in node &&
        'position' in node
      );
    });
  } catch {
    return [];
  }
}

// 序列化 Canvas nodes
export function stringifyCanvasNodes(nodes: CanvasNode[]): string {
  return JSON.stringify(nodes);
}
