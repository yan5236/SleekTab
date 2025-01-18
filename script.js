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
    const showBookmarkActions = document.getElementById('show-bookmark-actions');
    const customSelect = document.querySelector('.custom-select');
    const selectedOption = document.querySelector('.selected-option');
    const optionsContainer = document.querySelector('.options-container');
    const options = document.querySelectorAll('.option');

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

    // 加载显示编辑按钮设置
    const savedShowBookmarkActions = localStorage.getItem('show-bookmark-actions');
    showBookmarkActions.checked = savedShowBookmarkActions === null ? true : savedShowBookmarkActions === 'true';
    updateBookmarkActionsVisibility(showBookmarkActions.checked);

    // 监听显示编辑按钮设置变化
    showBookmarkActions.addEventListener('change', () => {
        localStorage.setItem('show-bookmark-actions', showBookmarkActions.checked);
        updateBookmarkActionsVisibility(showBookmarkActions.checked);
    });

    // 更新编辑按钮显示状态
    function updateBookmarkActionsVisibility(show) {
        const style = document.getElementById('bookmark-actions-style') || document.createElement('style');
        style.id = 'bookmark-actions-style';
        if (!show) {
            style.textContent = `
                .bookmark .bookmark-actions { display: none !important; }
                .bookmark:hover .bookmark-actions { display: none !important; }
            `;
        } else {
            style.textContent = `
                .bookmark .bookmark-actions { display: none; }
                .bookmark:hover .bookmark-actions { display: flex; }
            `;
        }
        if (!style.parentNode) {
            document.head.appendChild(style);
        }
    }

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
                <div class="bookmark-actions">
                    <button class="bookmark-action-btn" onclick="editBookmark(event, '${bookmark.name}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="bookmark-action-btn" onclick="deleteBookmark(event, '${bookmark.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            bookmarksList.appendChild(bookmarkElement);
        });
        updateBookmarksEditList();
        // 更新编辑按钮显示状态
        updateBookmarkActionsVisibility(showBookmarkActions.checked);
    }

    // 更新编辑列表
    function updateBookmarksEditList() {
        const bookmarksEditList = document.getElementById('bookmarks-edit-list');
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || defaultBookmarks;
        
        bookmarksEditList.innerHTML = '';
        bookmarks.forEach(bookmark => {
            const item = document.createElement('div');
            item.className = 'bookmark-edit-item';
            item.innerHTML = `
                <img src="${bookmark.icon}" alt="${bookmark.name}" onerror="this.src='default-icon.png'">
                <div class="bookmark-edit-info">
                    <div class="bookmark-edit-name">${bookmark.name}</div>
                    <div class="bookmark-edit-url">${bookmark.url}</div>
                </div>
                <div class="bookmark-edit-actions">
                    <button class="edit-btn" onclick="editBookmark(event, '${bookmark.name}')">编辑</button>
                    <button class="delete-btn" onclick="deleteBookmark(event, '${bookmark.name}')">删除</button>
                </div>
            `;
            bookmarksEditList.appendChild(item);
        });
    }

    // 初始化编辑功能
    function initBookmarkEdit() {
        const editButton = document.getElementById('edit-bookmarks-button');
        const bookmarksModal = document.getElementById('bookmarks-modal');
        const bookmarkFormModal = document.getElementById('bookmark-form-modal');
        const addBookmarkButton = document.getElementById('add-bookmark');
        const saveBookmarkButton = document.getElementById('save-bookmark');
        const closeButtons = document.querySelectorAll('.close-modal');

        // 打开编辑模态框
        editButton.addEventListener('click', () => {
            bookmarksModal.classList.add('show');
            updateBookmarksEditList();
        });

        // 关闭模态框
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').classList.remove('show');
            });
        });

        // 添加新书签
        addBookmarkButton.addEventListener('click', () => {
            document.getElementById('bookmark-form-title').textContent = '添加快速访问';
            document.getElementById('bookmark-name').value = '';
            document.getElementById('bookmark-url').value = '';
            document.getElementById('bookmark-icon').value = '';
            document.getElementById('save-bookmark').removeAttribute('data-edit');
            bookmarkFormModal.classList.add('show');
        });

        // 保存书签
        saveBookmarkButton.addEventListener('click', () => {
            const name = document.getElementById('bookmark-name').value.trim();
            const url = document.getElementById('bookmark-url').value.trim();
            const icon = document.getElementById('bookmark-icon').value.trim();
            
            if (!name || !url) {
                alert('请填写名称和网址！');
                return;
            }

            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || defaultBookmarks;
            const editName = saveBookmarkButton.getAttribute('data-edit');
            
            if (editName) {
                // 编辑现有书签
                const index = bookmarks.findIndex(b => b.name === editName);
                if (index !== -1) {
                    bookmarks[index] = { name, url, icon };
                }
            } else {
                // 添加新书签
                bookmarks.push({ name, url, icon });
            }

            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            bookmarkFormModal.classList.remove('show');
            loadBookmarks();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }

    // 初始化编辑功能
    initBookmarkEdit();

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
    const container = document.querySelector('.container');

    // 打开设置模态框
    settingsButton.addEventListener('click', () => {
        settingsModal.classList.add('show');
        settingsModal.style.display = 'flex';
        if (window.innerWidth <= 768) {
            container.style.visibility = 'hidden';
        }
    });

    // 关闭设置模态框
    function closeSettingsModal() {
        settingsModal.classList.remove('show');
        settingsModal.style.display = 'none';
        if (window.innerWidth <= 768) {
            container.style.visibility = 'visible';
        }
    }

    // 关闭按钮点击事件
    closeModalButton.addEventListener('click', closeSettingsModal);

    // 点击模态框外部关闭
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });

    // 按ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
            closeSettingsModal();
        }
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        if (settingsModal.classList.contains('show')) {
            container.style.visibility = window.innerWidth <= 768 ? 'hidden' : 'visible';
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
    // 初始化搜索引擎选择器
    let currentSearchEngine = 'baidu';

    // 点击选择器显示/隐藏选项
    selectedOption.addEventListener('click', () => {
        customSelect.classList.toggle('active');
    });

    // 点击其他地方关闭选项
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });

    // 选择搜索引擎
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const icon = option.getAttribute('data-icon');
            const name = option.querySelector('span').textContent;
            
            // 更新选中的选项
            currentSearchEngine = value;
            selectedOption.querySelector('.search-engine-icon').src = icon;
            selectedOption.querySelector('.search-engine-name').textContent = name;
            
            // 保存选择到 preferredSearchEngine
            localStorage.setItem('preferredSearchEngine', value);
            
            // 关闭选项容器
            customSelect.classList.remove('active');
        });
    });

    // 加载保存的搜索引擎
    const savedSearchEngine = localStorage.getItem('preferredSearchEngine') || 'baidu';
    if (savedSearchEngine) {
        const option = document.querySelector(`.option[data-value="${savedSearchEngine}"]`);
        if (option) {
            const icon = option.getAttribute('data-icon');
            const name = option.querySelector('span').textContent;
            currentSearchEngine = savedSearchEngine;
            selectedOption.querySelector('.search-engine-icon').src = icon;
            selectedOption.querySelector('.search-engine-name').textContent = name;
        }
    }

    /**
     * 执行搜索
     * 使用搜索引擎管理器执行搜索
     */
    function performSearch() {
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) return;
        window.searchEngineManager.performSearch(searchTerm);
    }

    // 搜索事件监听
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 初始化时更新一次搜索引擎选项
    updateSearchEngineOptions();

    // 便签功能
    let stickyNotes = JSON.parse(localStorage.getItem('stickyNotes') || '[]');
    let contextMenu = null;

    // 创建右键菜单
    function createContextMenu(x, y) {
        // 如果已经存在菜单，先移除
        if (contextMenu) {
            document.body.removeChild(contextMenu);
        }

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        const addNoteItem = document.createElement('div');
        addNoteItem.className = 'context-menu-item';
        addNoteItem.textContent = '添加便签';
        addNoteItem.onclick = () => {
            createStickyNote(x, y);
            removeContextMenu();
        };

        contextMenu.appendChild(addNoteItem);
        document.body.appendChild(contextMenu);
    }

    // 移除右键菜单
    function removeContextMenu() {
        if (contextMenu) {
            document.body.removeChild(contextMenu);
            contextMenu = null;
        }
    }

    // 创建便签
    function createStickyNote(x, y, noteData = null) {
        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.style.left = `${noteData ? noteData.x : x}px`;
        note.style.top = `${noteData ? noteData.y : y}px`;
        if (noteData && noteData.width) note.style.width = noteData.width;
        if (noteData && noteData.height) note.style.height = noteData.height;

        const header = document.createElement('div');
        header.className = 'sticky-note-header';

        const lockBtn = document.createElement('button');
        lockBtn.className = 'sticky-note-btn';
        lockBtn.innerHTML = '<i class="fas fa-lock-open"></i>';
        lockBtn.title = '锁定/解锁';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'sticky-note-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = '删除';

        header.appendChild(lockBtn);
        header.appendChild(deleteBtn);

        const content = document.createElement('textarea');
        content.className = 'sticky-note-content';
        content.value = noteData ? noteData.content : '';
        content.placeholder = '在这里输入内容...';

        note.appendChild(header);
        note.appendChild(content);

        // 拖动功能
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        header.addEventListener('mousedown', (e) => {
            if (!note.classList.contains('locked')) {
                isDragging = true;
                initialX = e.clientX - note.offsetLeft;
                initialY = e.clientY - note.offsetTop;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                note.style.left = `${currentX}px`;
                note.style.top = `${currentY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                saveStickyNotes();
            }
        });

        // 锁定功能
        lockBtn.addEventListener('click', () => {
            note.classList.toggle('locked');
            content.readOnly = note.classList.contains('locked');
            lockBtn.innerHTML = note.classList.contains('locked') ? 
                '<i class="fas fa-lock"></i>' : 
                '<i class="fas fa-lock-open"></i>';
            saveStickyNotes();
        });

        // 删除功能
        deleteBtn.addEventListener('click', () => {
            document.body.removeChild(note);
            saveStickyNotes();
        });

        // 内容变化时保存
        content.addEventListener('input', saveStickyNotes);

        // 如果是已锁定的便签，设置锁定状态
        if (noteData && noteData.locked) {
            note.classList.add('locked');
            content.readOnly = true;
            lockBtn.innerHTML = '<i class="fas fa-lock"></i>';
        }

        document.body.appendChild(note);
        saveStickyNotes();
    }

    // 保存便签数据
    function saveStickyNotes() {
        const notes = Array.from(document.querySelectorAll('.sticky-note')).map(note => ({
            x: parseInt(note.style.left),
            y: parseInt(note.style.top),
            width: note.style.width,
            height: note.style.height,
            content: note.querySelector('.sticky-note-content').value,
            locked: note.classList.contains('locked')
        }));
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }

    // 加载便签
    function loadStickyNotes() {
        const enableStickyNotes = localStorage.getItem('enableStickyNotes') !== 'false';
        if (enableStickyNotes) {
            stickyNotes.forEach(noteData => {
                createStickyNote(0, 0, noteData);
            });
        }
    }

    // 初始化便签功能
    function initStickyNotes() {
        const enableStickyNotesCheckbox = document.getElementById('enable-sticky-notes');
        
        // 从localStorage加载设置
        const enableStickyNotes = localStorage.getItem('enableStickyNotes') !== 'false';
        enableStickyNotesCheckbox.checked = enableStickyNotes;

        // 监听设置变化
        enableStickyNotesCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('enableStickyNotes', e.target.checked);
            if (!e.target.checked) {
                // 移除所有便签
                document.querySelectorAll('.sticky-note').forEach(note => {
                    document.body.removeChild(note);
                });
            } else {
                // 重新加载便签
                loadStickyNotes();
            }
        });

        // 右键菜单
        document.addEventListener('contextmenu', (e) => {
            if (!enableStickyNotesCheckbox.checked) return;
            
            // 检查是否点击在便签上
            let target = e.target;
            while (target) {
                if (target.classList && target.classList.contains('sticky-note')) {
                    return;
                }
                target = target.parentElement;
            }

            e.preventDefault();
            createContextMenu(e.clientX, e.clientY);
        });

        // 点击其他地方时隐藏右键菜单
        document.addEventListener('click', removeContextMenu);

        // 加载已保存的便签
        loadStickyNotes();
    }

    // 在文档加载完成后初始化便签功能
    document.addEventListener('DOMContentLoaded', () => {
        // ... existing code ...
        initStickyNotes();
    });
});

// 移到全局作用域的函数
window.editBookmark = function(event, name) {
    event.preventDefault();
    const defaultBookmarks = [
        { name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
        { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
        { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
        { name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' },
        { name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
    ];
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || defaultBookmarks;
    const bookmark = bookmarks.find(b => b.name === name);
    if (bookmark) {
        document.getElementById('bookmark-form-title').textContent = '编辑快速访问';
        document.getElementById('bookmark-name').value = bookmark.name;
        document.getElementById('bookmark-url').value = bookmark.url;
        document.getElementById('bookmark-icon').value = bookmark.icon;
        document.getElementById('save-bookmark').setAttribute('data-edit', name);
        document.getElementById('bookmark-form-modal').classList.add('show');
    }
};

window.deleteBookmark = function(event, name) {
    event.preventDefault();
    if (confirm('确定要删除这个快速访问吗？')) {
        const defaultBookmarks = [
            { name: '百度', url: 'https://www.baidu.com', icon: 'https://www.baidu.com/favicon.ico' },
            { name: '微博', url: 'https://weibo.com', icon: 'https://weibo.com/favicon.ico' },
            { name: '知乎', url: 'https://www.zhihu.com', icon: 'https://static.zhihu.com/heifetz/favicon.ico' },
            { name: '淘宝', url: 'https://www.taobao.com', icon: 'https://www.taobao.com/favicon.ico' },
            { name: '哔哩哔哩', url: 'https://www.bilibili.com', icon: 'https://www.bilibili.com/favicon.ico' },
        ];
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || defaultBookmarks;
        const updatedBookmarks = bookmarks.filter(b => b.name !== name);
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        // 重新加载书签
        const bookmarksList = document.getElementById('bookmarks-list');
        bookmarksList.innerHTML = '';
        updatedBookmarks.forEach(bookmark => {
            const bookmarkElement = document.createElement('a');
            bookmarkElement.href = bookmark.url;
            bookmarkElement.className = 'bookmark';
            bookmarkElement.innerHTML = `
                <img src="${bookmark.icon}" alt="${bookmark.name}" onerror="this.src='default-icon.png'">
                <span>${bookmark.name}</span>
                <div class="bookmark-actions">
                    <button class="bookmark-action-btn" onclick="editBookmark(event, '${bookmark.name}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="bookmark-action-btn" onclick="deleteBookmark(event, '${bookmark.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            bookmarksList.appendChild(bookmarkElement);
        });
        // 更新编辑列表
        const bookmarksEditList = document.getElementById('bookmarks-edit-list');
        if (bookmarksEditList) {
            bookmarksEditList.innerHTML = '';
            updatedBookmarks.forEach(bookmark => {
                const item = document.createElement('div');
                item.className = 'bookmark-edit-item';
                item.innerHTML = `
                    <img src="${bookmark.icon}" alt="${bookmark.name}" onerror="this.src='default-icon.png'">
                    <div class="bookmark-edit-info">
                        <div class="bookmark-edit-name">${bookmark.name}</div>
                        <div class="bookmark-edit-url">${bookmark.url}</div>
                    </div>
                    <div class="bookmark-edit-actions">
                        <button class="edit-btn" onclick="editBookmark(event, '${bookmark.name}')">编辑</button>
                        <button class="delete-btn" onclick="deleteBookmark(event, '${bookmark.name}')">删除</button>
                    </div>
                `;
                bookmarksEditList.appendChild(item);
            });
        }
    }
};

