# sleektab新标签页

## 项目简介

这是一个简洁、现代化的自定义新标签页项目。它旨在提供一个美观且功能丰富的新标签页体验，可以直接在浏览器中使用，无需安装特定的扩展程序。

## 主要特性

- 简约现代的设计风格
- 快速搜索功能（默认使用百度搜索引擎）
- 常用网站快速访问
- 支持浅色和深色主题切换
- 响应式设计，适配各种设备屏幕
- 可作为在线版本使用，也可打包为浏览器扩展

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)

## 如何使用

### 在线版本

1. 将项目文件（index.html, styles.css, script.js）上传到网络服务器或静态网站托管服务（如GitHub Pages或Netlify）。
2. 在浏览器中访问托管的URL。
3. 可以使用"新标签页重定向"或类似的浏览器扩展，将此URL设置为新标签页。

### 本地使用

1. 下载项目文件（index.html, styles.css, script.js）到本地文件夹。
2. 在浏览器中打开index.html文件。

### 作为浏览器扩展使用

要将此项目打包为浏览器扩展，需要额外创建一个manifest文件，并按照相应浏览器的扩展开发指南进行打包。

## 自定义

### 修改默认书签

打开script.js文件，找到defaultBookmarks数组，按照以下格式添加或修改书签：

\`\`\`javascript
const defaultBookmarks = [
    { name: '网站名称', url: '网站URL', icon: '图标URL' },
    // 添加更多书签...
];
\`\`\`

### 修改搜索引擎

默认使用百度搜索。如需更改，请修改script.js文件中的搜索URL：

\`\`\`javascript
window.location.href = \`https://www.baidu.com/s?wd=\${encodeURIComponent(searchTerm)}\`;
\`\`\`

将上述URL替换为您想使用的搜索引擎URL。

## 贡献

欢迎提交问题报告和改进建议。如果您想为项目做出贡献，请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交您的更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 将您的更改推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目 GitHub 仓库：https://github.com/yan5236/SleekTab/
- 电子邮件：[您的邮箱地址]

感谢您使用我们的自定义新标签页！
