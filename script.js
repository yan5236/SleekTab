/**
 * 新标签页主要功能脚本
 * 包含以下功能模块：
 * 1. DOM元素初始化
 * 2. 双击隐藏功能
 * 3. 搜索框透明度控制
 * 4. 时钟显示
 * 5. 书签管理
 * 6. 主题切换
 * 7. 壁纸管理
 * 8. 设置模态框
 * 9. 模糊效果控制
 */

document.addEventListener('DOMContentLoaded', () => {
    /**
     * DOM元素初始化
     * 获取页面上所有需要操作的DOM元素
     */
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const bookmarksList = document.getElementById('bookmarks-list');
    const themeSelect = document.getElementById('theme-select');
    const wallpaperSource = document.getElementById('wallpaper-source');
    const onlineVersionNotice = document.getElementById('online-version-notice');
    const installLink = document.getElementById('install-link');
    const noticeCloseBtn = document.getElementById('notice-close');
    const clockElement = document.getElementById('clock');
    const searchOpacityInput = document.getElementById('search-opacity');
    const opacityValue = document.getElementById('opacity-value');
    const blurStrengthInput = document.getElementById('blur-strength');
    const blurValue = document.getElementById('blur-value');
    const enableDoubleClick = document.getElementById('enable-double-click');
    const searchEngine = document.getElementById('search-engine');

    /**
     * 双击隐藏功能模块
     * 实现双击页面时隐藏/显示界面元素的功能
     */
    // 加载双击隐藏设置
    const savedDoubleClickEnabled = localStorage.getItem('double-click-enabled');
    enableDoubleClick.checked = savedDoubleClickEnabled === null ? true : savedDoubleClickEnabled === 'true';

    // 监听双击设置变化
    enableDoubleClick.addEventListener('change', () => {
        localStorage.setItem('double-click-enabled', enableDoubleClick.checked);
    });

    // 添加双击隐藏/显示功能
    let elementsHidden = false;
    const elementsToToggle = [
        '.container',
        '#clock',
        '#settings-button',
        '#online-version-notice'
    ];

    document.addEventListener('dblclick', (e) => {
        if (!enableDoubleClick.checked) return; // 如果功能被禁用，直接返回
        if (e.target === document.body || e.target === document.documentElement) {
            elementsHidden = !elementsHidden;
            elementsToToggle.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.style.transition = 'opacity 0.3s ease';
                    element.style.opacity = elementsHidden ? '0' : '1';
                    element.style.pointerEvents = elementsHidden ? 'none' : 'auto';
                });
            });
        }
    });

    /**
     * 搜索框透明度控制模块
     * 控制搜索框背景的透明度
     */
    // 加载保存的搜索框背景透明度
    const savedOpacity = localStorage.getItem('search-opacity') || '90';
    searchOpacityInput.value = savedOpacity;
    opacityValue.textContent = `${savedOpacity}%`;
    updateSearchOpacity(savedOpacity);

    // 更新搜索框背景透明度
    function updateSearchOpacity(opacity) {
        const container = document.querySelector('.container');
        container.style.setProperty('--search-bg-opacity', opacity / 100);
        localStorage.setItem('search-opacity', opacity);
    }

    // 监听透明度变化
    searchOpacityInput.addEventListener('input', (e) => {
        const opacity = e.target.value;
        opacityValue.textContent = `${opacity}%`;
        updateSearchOpacity(opacity);
    });

    /**
     * 时钟显示模块
     * 显示和更新页面上的时钟
     */
    // 更新时钟显示
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 初始化时钟并每秒更新
    updateClock();
    setInterval(updateClock, 1000);

    /**
     * 书签管理模块
     * 管理和显示快速访问书签
     */
    // 默认书签配置
    const defaultBookmarks = [
        { name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
        { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
        { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
        { name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' },
        { name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
    ];

    // 加载书签
    function loadBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || defaultBookmarks;
        bookmarksList.innerHTML = '';
        bookmarks.forEach(bookmark => {
            const bookmarkElement = document.createElement('a');
            bookmarkElement.href = bookmark.url;
            bookmarkElement.className = 'bookmark';
            bookmarkElement.innerHTML = `
                <img src="${bookmark.icon}" alt="${bookmark.name}" onerror="this.src='default-icon.png'">
                <span>${bookmark.name}</span>
            `;
            bookmarksList.appendChild(bookmarkElement);
        });
    }

    /**
     * 主题切换模块
     * 管理页面主题的切换（浅色/深色）
     */
    // 主题切换时更新搜索引擎下拉箭头颜色
    themeSelect.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', themeSelect.value === 'dark');
        localStorage.setItem('theme', themeSelect.value);
        window.searchEngineManager.updateSearchEngineIcon();
    });

    // 加载保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');

    /**
     * 在线版本提示模块
     * 处理在线版本的提示信息
     */
    // 检查是否作为扩展运行
    const isExtension = window.location.protocol === 'chrome-extension:' || 
                       (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
                       
    if (!isExtension && !localStorage.getItem('notice_closed')) {
        onlineVersionNotice.classList.remove('hidden');
    }

    // 关闭提示按钮
    if (noticeCloseBtn) {
        noticeCloseBtn.addEventListener('click', () => {
            onlineVersionNotice.classList.add('hidden');
            localStorage.setItem('notice_closed', 'true');
        });
    }

    // 安装链接
    if (installLink) {
        installLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('https://github.com/yan5236/SleekTab-crx', '_blank');
        });
    }

    /**
     * 壁纸管理模块
     * 处理背景壁纸的设置和更新
     */
    // 设置壁纸
    function setWallpaper() {
        const source = localStorage.getItem('wallpaper-source') || 'bing-daily';
        let imageUrl;
        
        if (source === 'bing-daily') {
            imageUrl = 'https://bing.img.run/1920x1080.php';
        } else {
            imageUrl = 'https://bing.img.run/rand_uhd.php';
        }
        
        // 创建新图片对象来预加载
        const img = new Image();
        img.onload = function() {
            document.body.style.backgroundImage = `url('${imageUrl}')`;
        };
        img.src = imageUrl;
    }

    // 壁纸源切换
    wallpaperSource.addEventListener('change', () => {
        localStorage.setItem('wallpaper-source', wallpaperSource.value);
        setWallpaper();
    });

    // 加载保存的壁纸源设置
    const savedWallpaperSource = localStorage.getItem('wallpaper-source') || 'bing-daily';
    wallpaperSource.value = savedWallpaperSource;

    // 初始化壁纸
    setWallpaper();

    // 定时更新壁纸
    setInterval(() => {
        if (localStorage.getItem('wallpaper-source') === 'bing-daily') {
            // 每天更新一次
            setWallpaper();
        } else {
            // 每小时更新一次
            const now = new Date();
            if (now.getMinutes() === 0) { // 整点更新
                setWallpaper();
            }
        }
    }, 60 * 1000); // 每分钟检查一次

    // 初始化加载书签
    loadBookmarks();

    /**
     * 设置模态框模块
     * 处理设置界面的显示和隐藏
     */
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalButton = document.querySelector('.close-modal');

    // 打开设置模态框
    settingsButton.addEventListener('click', () => {
        settingsModal.classList.add('show');
    });

    // 关闭设置模态框
    closeModalButton.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });

    // 点击模态框外部关闭
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('show');
        }
    });

    // 按ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
            settingsModal.classList.remove('show');
        }
    });

    /**
     * 模糊效果控制模块
     * 控制背景图片的模糊效果强度
     */
    // 加载保存的模糊效果强度
    const savedBlur = localStorage.getItem('blur-strength') || '20';
    blurStrengthInput.value = savedBlur;
    blurValue.textContent = `${savedBlur}px`;
    updateBlurEffect(savedBlur);

    // 更新模糊效果强度
    function updateBlurEffect(strength) {
        document.documentElement.style.setProperty('--blur-strength', `${strength}px`);
        localStorage.setItem('blur-strength', strength);
    }

    // 监听模糊强度变化
    blurStrengthInput.addEventListener('input', (e) => {
        const strength = e.target.value;
        blurValue.textContent = `${strength}px`;
        updateBlurEffect(strength);
    });

    /**
     * 搜索功能模块
     * 实现搜索功能
     */
    // 添加搜索功能
    function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        const selectedEngine = searchEngine.value;
        let searchUrl;

        // 获取保存的自定义搜索引擎
        const customSearchEngines = JSON.parse(localStorage.getItem('customSearchEngines') || '{}');
        // 查找是否是自定义搜索引擎
        const customEngine = customSearchEngines[selectedEngine];

        if (customEngine) {
            // 如果是自定义搜索引擎，使用其URL模板
            const baseUrl = customEngine.url;
            const queryParam = customEngine.queryParam;
            searchUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryParam}=${encodeURIComponent(query)}`;
        } else {
            // 默认搜索引擎
            switch (selectedEngine) {
                case 'baidu':
                    searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
                    break;
                case 'google':
                    searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'bing':
                    searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                    break;
                case 'sogou':
                    searchUrl = `https://www.sogou.com/web?query=${encodeURIComponent(query)}`;
                    break;
                case 'duckduckgo':
                    searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                    break;
                case 'yandex':
                    searchUrl = `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
                    break;
                case 'github':
                    searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
                    break;
                default:
                    searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
            }
        }

        window.location.href = searchUrl;
    }

    // 点击搜索按钮时执行搜索
    searchButton.addEventListener('click', performSearch);

    // 在搜索框按回车时执行搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

