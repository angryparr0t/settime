'use strict'

import {
  app,
  protocol,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  globalShortcut,
  ipcMain
} from 'electron'
import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {
  VUEJS3_DEVTOOLS
} from 'electron-devtools-installer'
import fs from 'fs';
import path from 'path';
const isDevelopment = process.env.NODE_ENV !== 'production'

// 将 win 变量提升到全局作用域
let win
let tray = null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1546,
    height: 1045,
    maximized: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  // 检查登录状态
  win.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(`
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        window.location.href = '/login';
      }
    `).catch(err => {
      console.log('检查登录状态失败:', err);
    });
  });

  // 创建系统托盘
  createTray();
}

// 在应用退出前清除登录状态
app.on('before-quit', () => {
  if (win && !win.isDestroyed()) {
    win.webContents.executeJavaScript(`
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
    `).catch(err => {
      console.log('清除登录状态失败:', err);
    });
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  // 注册全局快捷键
  registerShortcuts()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// 创建系统托盘
function createTray() {
  if (tray) return;

  // 使用正确的图标路径
  let iconPath;
  if (isDevelopment) {
    // 开发环境：使用相对路径
    iconPath = process.platform === 'win32' ? './public/favicon.ico' : './public/favicon.ico';
  } else {
    // 生产环境：使用 app.getAppPath() 获取应用根目录
    const path = require('path');
    iconPath = path.join(app.getAppPath(), 'public', 'favicon.ico');
  }

  try {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([{
        label: '显示主窗口',
        click: () => {
          if (win) {
            win.show();
            win.focus();
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      }
    ]);
    tray.setToolTip('日程管理系统');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (win) {
        win.show();
        win.focus();
      }
    });
    console.log('系统托盘创建成功，图标路径:', iconPath);
  } catch (error) {
    console.error('创建系统托盘失败:', error);
    console.log('尝试的图标路径:', iconPath);
  }
}

// 系统通知（可供渲染进程通过ipc调用）
function showScheduleNotification(title, body) {
  let iconPath;
  if (isDevelopment) {
    iconPath = './public/favicon.ico';
  } else {
    const path = require('path');
    iconPath = path.join(app.getAppPath(), 'public', 'favicon.ico');
  }

  new Notification({
    title: title || '日程提醒',
    body: body || '您有新的日程安排',
    icon: iconPath
  }).show();
}

// 注册全局快捷键（可选，示例）
function registerShortcuts() {
  // 例如：Ctrl+Shift+S 显示主窗口
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (win) {
      win.show();
      win.focus();
    }
  });
}

// 可选：在app退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC 通信处理
ipcMain.handle('show-notification', async (event, title, body) => {
  showScheduleNotification(title, body);
});

// 数据持久化：保存和加载chatMessages
const dataFilePath = path.join(app.getPath('userData'), 'chatData.json');

ipcMain.handle('save-chat-data', async (event, data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});
ipcMain.handle('load-chat-data', async () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, 'utf-8');
      return {
        success: true,
        data: JSON.parse(content)
      };
    }
    return {
      success: true,
      data: []
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});

// 数据持久化：保存和加载 scheduleData
const scheduleFilePath = path.join(app.getPath('userData'), 'scheduleData.json');

ipcMain.handle('save-schedule-data', async (event, data) => {
  try {
    fs.writeFileSync(scheduleFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});
ipcMain.handle('load-schedule-data', async () => {
  try {
    if (fs.existsSync(scheduleFilePath)) {
      const content = fs.readFileSync(scheduleFilePath, 'utf-8');
      return {
        success: true,
        data: JSON.parse(content)
      };
    }
    return {
      success: true,
      data: []
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});