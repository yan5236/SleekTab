# SleekTab 插件开发指南

## 插件结构

每个插件由两部分组成：
1. 功能代码（JavaScript）
2. 样式代码（CSS，可选）

### 功能代码基本结构

```javascript
const plugin = {
    // 必需的属性
    id: 'plugin-id',              // 插件唯一标识符
    name: '插件名称',             // 显示在设置页面的名称
    description: '插件描述',      // 显示在设置页面的描述
    version: '1.0.0',            // 插件版本号

    // 可选属性
    author: '作者名称',          // 插件作者
    enabled: false,              // 插件是否启用

    // 生命周期方法
    initialize() {
        // 插件初始化时调用
        // 可以在这里进行必要的设置
    },

    enable() {
        // 插件被启用时调用
        this.enabled = true;
    },

    disable() {
        // 插件被禁用时调用
        this.enabled = false;
    }
};

// 必须返回插件对象
return plugin;
```

### 样式代码

```css
/* 建议使用特定的前缀来避免样式冲突 */
.your-plugin-prefix-class {
    /* 你的样式 */
}

/* 支持深色主题 */
body.dark-theme .your-plugin-prefix-class {
    /* 深色主题下的样式 */
}
```

## 插件生命周期

1. **安装**: 用户粘贴代码并点击安装按钮
2. **初始化**: 调用 `initialize()` 方法
3. **启用/禁用**: 用户通过开关控制，调用 `enable()/disable()`
4. **卸载**: 清理插件相关的所有资源

## 数据持久化

插件可以使用 localStorage 来存储数据：

```javascript
// 保存数据
localStorage.setItem('your-plugin-id-data', JSON.stringify(data));

// 读取数据
const data = JSON.parse(localStorage.getItem('your-plugin-id-data'));
```

## 示例：便签插件

### 功能代码
```javascript
const stickyNotesPlugin = {
    id: 'sticky-notes',
    name: '便签',
    description: '在页面上添加可拖动的便签',
    version: '1.0.0',
    author: 'Your Name',
    enabled: false,

    initialize() {
        this.loadData();
        this.setupEvents();
    },

    enable() {
        this.enabled = true;
        this.show();
    },

    disable() {
        this.enabled = false;
        this.hide();
    }
};

return stickyNotesPlugin;
```

### 样式代码
```css
.sticky-note {
    position: fixed;
    background: rgba(255, 235, 59, 0.9);
    /* 其他样式... */
}

body.dark-theme .sticky-note {
    background: rgba(66, 66, 66, 0.9);
    /* 深色主题样式... */
}
```

## 最佳实践

1. **命名规范**
   - 使用有意义的插件 ID，避免与其他插件冲突
   - CSS 类名添加插件特定前缀

2. **性能优化**
   - 及时清理事件监听器
   - 避免过度使用 localStorage
   - 优化 DOM 操作

3. **用户体验**
   - 提供清晰的功能描述
   - 支持深色主题
   - 添加适当的错误处理

4. **代码质量**
   - 保持代码简洁
   - 添加必要的注释
   - 处理可能的错误情况

## 调试技巧

1. 在浏览器控制台中可以访问 `addonManager` 对象
2. 使用 `console.log` 进行调试
3. 检查 localStorage 中的数据

## 注意事项

1. 插件代码在安装时会使用 `Function` 构造器执行
2. 确保代码安全，不要包含危险操作
3. 样式代码要注意作用域，避免影响其他元素
4. 在卸载时清理所有资源，避免内存泄漏

## 提交插件

目前插件是通过代码方式分发的。如果你开发了一个好用的插件，可以：

1. 测试确保功能正常
2. 优化代码和样式
3. 编写清晰的使用说明
4. 分享给其他用户

## 常见问题

Q: 为什么我的插件安装失败？  
A: 检查是否包含所有必需的属性，以及代码格式是否正确。

Q: 如何调试插件？  
A: 可以在代码中添加 console.log，通过浏览器开发者工具查看输出。

Q: 插件的样式会影响到其他插件吗？  
A: 建议使用特定前缀来避免样式冲突。每个插件的样式都是独立的。 