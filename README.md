# SetTime - 智能日程管理系统

一个基于 Electron + Vue.js 的桌面应用程序，集成了智能聊天、日程管理和视频列表功能。

## 🚀 功能特性

- **智能聊天**: 集成 AI 聊天功能，支持自然语言交互
- **日程管理**: 完整的日程安排和管理系统
- **视频列表**: 支持视频内容管理和播放
- **桌面通知**: 系统托盘和通知提醒
- **数据持久化**: 本地数据存储，确保数据安全
- **用户认证**: 登录系统，保护用户隐私

## 🛠️ 技术栈

- **前端框架**: Vue.js 3
- **桌面应用**: Electron
- **构建工具**: Vue CLI + Electron Builder
- **样式**: CSS3
- **数据存储**: 本地 JSON 文件

## 📦 安装和运行

### 环境要求

- Node.js (推荐 v16 或更高版本)
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run electron:serve
```

### 构建生产版本

```bash
npm run electron:build
```

## 🎯 主要功能

### 1. 智能聊天

- 支持与 AI 助手进行自然语言对话
- 聊天历史记录保存
- 实时响应

### 2. 日程管理

- 创建、编辑、删除日程
- 日程提醒功能
- 日历视图展示

### 3. 视频列表

- 视频内容管理
- 播放列表功能
- 视频信息展示

### 4. 系统功能

- 系统托盘支持
- 全局快捷键
- 桌面通知

## 📁 项目结构

```
settime/
├── src/
│   ├── components/     # Vue组件
│   ├── api/           # API接口
│   ├── config/        # 配置文件
│   ├── utils/         # 工具函数
│   ├── router/        # 路由配置
│   └── background.js  # Electron主进程
├── public/            # 静态资源
├── dist_electron/     # 构建输出
└── package.json       # 项目配置
```

## 🔧 配置说明

项目使用环境变量进行配置，主要配置项包括：

- API 接口地址
- AI 服务配置
- 应用设置

## 📝 开发说明

### 分支管理

- `main`: 主分支，用于生产版本
- `dev0531`: 开发分支，用于功能开发

### 提交规范

使用语义化提交信息：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

- **angryparr0t** - 项目开发者

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！
