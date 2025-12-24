// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToSpace',
    title: '添加至空间',
    contexts: ['page', 'selection']
  });
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'saveToSpace') {
    const url = tab?.url;

    if (!url) {
      console.error('No URL found');
      return;
    }

    // 发送消息到 content script 或直接处理
    try {
      await saveToSpace(url, tab?.id);
    } catch (error) {
      console.error('Failed to save to space:', error);
      notifyError(tab?.id, '保存失败，请重试');
    }
  }
});

async function saveToSpace(url: string, tabId?: number) {
  const apiUrl = 'http://localhost:3000/api/space/save';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.success) {
    notifySuccess(tabId, '已成功添加到空间');
  } else {
    throw new Error(result.error?.message || '保存失败');
  }
}

function notifySuccess(tabId?: number, message?: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Canvas Space',
    message: message || '保存成功',
  });
}

function notifyError(tabId?: number, message?: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Canvas Space',
    message: message || '保存失败',
  });
}

export {};
