# Canvas Space Saver Extension

一个用于保存网页到 Canvas 空间的 Chrome 浏览器扩展。

## 功能特性

- 右键菜单保存当前网页到空间
- 自动提取网页元数据（标题、描述、分享图、图标）
- 保存到服务端并自动添加到 Canvas 节点

## 开发

### 安装依赖

```bash
bun install
```

### 构建

```bash
bun run dev
```

构建产物将输出到 `dist` 目录。

### 在 Chrome 中加载

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist` 目录

## 使用方法

1. 在任意网页上点击右键
2. 选择"添加至空间"
3. 扩展会自动将网页信息发送到服务端
4. 服务端会解析网页元数据并保存为节点

## API

### POST /api/space/save

保存网页到空间。

**请求体：**
```json
{
  "url": "https://example.com"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "message": "Saved to space successfully",
    "node": {
      "id": 1,
      "url": "https://example.com",
      "title": "Example",
      "description": "Example description",
      "imagePath": "/uploads/images/xxx.png",
      "iconPath": "/uploads/images/yyy.png"
    }
  },
  "timestamp": 1234567890
}
```

## 文件结构

```
extensions/
├── src/
│   ├── manifest.json     # 扩展配置
│   └── background.ts     # 后台脚本
├── dist/                 # 构建输出
├── build.ts             # 构建脚本
└── package.json
```

## 技术栈

- TypeScript
- Bun (运行时和构建工具)
- Chrome Extension Manifest V3
