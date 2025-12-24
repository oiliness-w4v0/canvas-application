export interface WebMetadata {
  title: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
}

export async function fetchWebMetadata(url: string): Promise<WebMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const metadata = parseMetadata(html, url);

    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}

function parseMetadata(html: string, baseUrl: string): WebMetadata {
  const metadata: WebMetadata = {
    title: 'Untitled',
  };

  // 提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // 提取描述
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) {
    metadata.description = descMatch[1].trim();
  }

  // 提取 Open Graph 图片
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) {
    metadata.imageUrl = resolveUrl(ogImageMatch[1], baseUrl);
  }

  // 提取 Twitter 图片
  const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  if (twitterImageMatch && !metadata.imageUrl) {
    metadata.imageUrl = resolveUrl(twitterImageMatch[1], baseUrl);
  }

  // 提取 favicon
  const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
  if (iconMatch) {
    metadata.iconUrl = resolveUrl(iconMatch[1], baseUrl);
  }

  // 如果没有找到 icon，尝试 /favicon.ico
  if (!metadata.iconUrl) {
    try {
      const urlObj = new URL(baseUrl);
      metadata.iconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    } catch (e) {
      // 忽略错误
    }
  }

  return metadata;
}

function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  try {
    const base = new URL(baseUrl);
    return new URL(url, base).href;
  } catch (e) {
    console.error('Error resolving URL:', e);
    return url;
  }
}
