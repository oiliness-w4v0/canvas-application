import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

export async function downloadImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Failed to download image: ${url} - Status: ${response.status}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // 生成唯一文件名
    const ext = getExtension(url);
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const filename = `${hash}${ext}`;

    // 确保目录存在
    const uploadDir = join(process.cwd(), 'uploads', 'images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存文件
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, uint8Array);

    return `/uploads/images/${filename}`;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

function getExtension(url: string): string {
  // 从 URL 中提取扩展名
  const match = url.match(/\.(jpg|jpeg|png|gif|webp|ico|svg)(\?|$)/i);
  if (match) {
    return `.${match[1].toLowerCase()}`;
  }

  // 根据 Content-Type 推断（这里简化处理）
  return '.png';
}

export async function downloadMetadataImages(
  imageUrl?: string,
  iconUrl?: string
): Promise<{ imagePath?: string; iconPath?: string }> {
  const result: { imagePath?: string; iconPath?: string } = {};

  if (imageUrl) {
    result.imagePath = await downloadImage(imageUrl);
  }

  if (iconUrl) {
    result.iconPath = await downloadImage(iconUrl);
  }

  return result;
}
