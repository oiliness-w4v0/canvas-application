import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// 构建后台脚本
Bun.build({
  entrypoints: ["./src/background.ts"],
  outdir: "./dist",
  minify: true,
  sourcemap: true,
  target: "browser",
})

// 复制 manifest.json
copyFileSync('./src/manifest.json', './dist/manifest.json');

// 创建 icons 目录（如果不存在）
const iconsDir = join('./dist', 'icons');
try {
  mkdirSync(iconsDir, { recursive: true });
} catch (e) {
  // 目录已存在
}

console.log('✅ Build complete! Extension files are in ./dist');