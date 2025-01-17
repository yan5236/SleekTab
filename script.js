document.addEventListener('DOMContentLoaded', () => {
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

    // Default bookmarks
    const defaultBookmarks = [
        { name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
        { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
        { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
        { name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' },
        { name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
    ];

    // Load bookmarks
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

    // 主题切换时更新搜索引擎下拉箭头颜色
    themeSelect.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', themeSelect.value === 'dark');
        localStorage.setItem('theme', themeSelect.value);
        window.searchEngineManager.updateSearchEngineIcon();
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSelect.value = savedTheme;
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');

    // Check if running as an extension
    if (!chrome.runtime && !localStorage.getItem('notice_closed')) {
        onlineVersionNotice.classList.remove('hidden');
    }

    // Close notice button
    if (noticeCloseBtn) {
        noticeCloseBtn.addEventListener('click', () => {
            onlineVersionNotice.classList.add('hidden');
            localStorage.setItem('notice_closed', 'true');
        });
    }

    // Install link (for demonstration, replace with actual install link)
    installLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('This is where you would provide instructions to install the extension.');
    });

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

    // Load bookmarks on page load
    loadBookmarks();

    // 设置模态框相关
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
});

