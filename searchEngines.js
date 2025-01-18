/**
 * 搜索引擎管理模块
 * 提供搜索引擎的管理、切换和搜索功能
 */

/**
 * 默认搜索引擎配置
 * 包含预设的搜索引擎信息：
 * - name: 搜索引擎名称
 * - url: 搜索基础URL
 * - queryParam: 查询参数名
 * - icon: 图标URL
 */
const defaultSearchEngines = {
    baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s',
        queryParam: 'wd',
        icon: 'https://www.baidu.com/favicon.ico'
    },
    google: {
        name: '谷歌',
        url: 'https://www.google.com/search',
        queryParam: 'q',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABjUExURUxpcf////8gIP8AAP93d/9AQP9QUP+AgP9gYP+Pj/+vr/+fn/+/v/+goP/Pz/+wsP/v7/+Bgf9hYf/f3/+QkP+wsPwAAP+AgP/f3/+fn/9wcP+vr//Pz/+Pj/9QUP8QEP8gIP///7BxvbgAAAAfdFJOUwCR7v4FxzK/Cw0DBmvB5S6MiuQlrYPaYBxbzlQ5SJEzjwoAAAFKSURBVDjLfVPZloMgDEQEF9wVt7bT5f//sgFxqaedd8gJk5tJCP5EKeUfQPrHkP4EUkpTBmF0wgjICMUY0+z7F4TVNI1SjXa4YeNkXdd1MwxnMMuyLG3b/gR0XZem6RcE1wkh67oaY+Z5TpLkBgGHMAzjOEaSGGPXdRdEWZYhBLQsSxAEGOM8zzHGF0RRFBDQsiymaQqC4IwoimJZFoxxHMcEhBCSZRkEwDn3PA8hdEI8z4MAmOd5kiQQUFUVxvgCKYriApnnGUJwxvM8vwP2fccYb9t2hxRFQSlFCBlj3gHbtkFAVVUQ4Ps+pVQp9Q7Y9/0CgZZ93z8cBwS01r7vE0Jc130H6DTGEELgbsuyOI5j23YQBFrrEwL+4zhCCBDQNI1lWUEQnBBjDNwNwxBFked5bdsCwg3xC4RzrpQ6IfAL5xwQ8Ot53l/4AZTyJEXbULHAAAAAAElFTkSuQmCC'
    },
    bing: {
        name: '必应',
        url: 'https://www.bing.com/search',
        queryParam: 'q',
        icon: 'https://www.bing.com/favicon.ico'
    },
    sogou: {
        name: '搜狗',
        url: 'https://www.sogou.com/web',
        queryParam: 'query',
        icon: 'https://www.sogou.com/favicon.ico'
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/',
        queryParam: 'q',
        icon: 'https://duckduckgo.com/favicon.ico'
    },
    yandex: {
        name: 'Yandex',
        url: 'https://yandex.com/search/',
        queryParam: 'text',
        icon: 'https://yandex.com/favicon.ico'
    },
    github: {
        name: 'GitHub',
        url: 'https://github.com/search',
        queryParam: 'q',
        icon: 'https://github.com/favicon.ico'
    }
};

/**
 * 搜索引擎管理类
 * 处理搜索引擎的添加、编辑、删除和搜索功能
 */
class SearchEngineManager {
    constructor() {
        this.loadCustomEngines();
        this.initEventListeners();
    }

    /**
     * 加载自定义搜索引擎
     * 从localStorage中读取用户自定义的搜索引擎配置
     */
    loadCustomEngines() {
        this.customEngines = JSON.parse(localStorage.getItem('customSearchEngines') || '{}');
        this.updateUI();
    }

    /**
     * 获取所有搜索引擎
     * 合并默认搜索引擎和自定义搜索引擎
     */
    getAllEngines() {
        return { ...defaultSearchEngines, ...this.customEngines };
    }

    /**
     * 添加搜索引擎
     * @param {string} name - 搜索引擎名称
     * @param {string} url - 搜索URL
     * @param {string} icon - 图标URL（可选）
     */
    addSearchEngine(name, url, icon = '') {
        if (!name || !url) {
            throw new Error('请填写搜索引擎名称和URL！');
        }
        
        // 从URL中提取查询参数名称
        let queryParam = 'q';
        try {
            const urlObj = new URL(url);
            const searchParams = new URLSearchParams(urlObj.search);
            // 获取第一个查询参数名称
            for (const [key] of searchParams) {
                queryParam = key;
                break;
            }
        } catch (e) {
            // 如果URL无效，使用默认的查询参数名称
            console.warn('Invalid URL format, extracting query parameter from URL string');
            const queryMatch = url.match(/[?&]([^=]+)=/);
            if (queryMatch) {
                queryParam = queryMatch[1];
            }
        }

        // 如果URL不包含{q}，自动在末尾添加
        if (!url.includes('{q}')) {
            url = url + (url.includes('?') ? '&' : '?') + `${queryParam}={q}`;
        }

        // 生成唯一ID
        const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_');
        
        // 检查是否已存在
        if (defaultSearchEngines[id] || this.customEngines[id]) {
            throw new Error('该搜索引擎名称已存在！');
        }

        // 提取基础URL和查询参数
        let baseUrl = url;
        try {
            const urlObj = new URL(url);
            const searchParams = new URLSearchParams(urlObj.search);
            for (const [key, value] of searchParams) {
                if (value === '{q}') {
                    queryParam = key;
                    break;
                }
            }
            baseUrl = url.split('?')[0];
        } catch (e) {
            console.warn('Invalid URL format, using original URL');
        }

        this.customEngines[id] = {
            name,
            url: baseUrl,
            queryParam,
            icon: icon || 'default-icon.png'
        };
        
        this.saveCustomEngines();
        this.updateUI();
    }

    /**
     * 编辑搜索引擎
     * @param {string} id - 搜索引擎ID
     * @returns {Object|null} - 返回被编辑的搜索引擎对象，如果不存在则返回null
     */
    editSearchEngine(id) {
        const engine = this.customEngines[id];
        if (!engine) return null;
        
        delete this.customEngines[id];
        this.saveCustomEngines();
        this.updateUI();
        
        return engine;
    }

    /**
     * 删除搜索引擎
     * @param {string} id - 搜索引擎ID
     * @returns {boolean} - 删除是否成功
     */
    deleteSearchEngine(id) {
        if (!this.customEngines[id]) return false;
        
        delete this.customEngines[id];
        this.saveCustomEngines();
        this.updateUI();
        return true;
    }

    /**
     * 保存自定义搜索引擎到localStorage
     */
    saveCustomEngines() {
        localStorage.setItem('customSearchEngines', JSON.stringify(this.customEngines));
    }

    /**
     * 更新UI
     * 更新搜索引擎列表和选择器
     */
    updateUI() {
        this.updateSearchEngineList();
        this.updateSearchEngineSelect();
    }

    /**
     * 更新搜索引擎列表
     * 在设置面板中显示自定义搜索引擎列表
     */
    updateSearchEngineList() {
        const container = document.getElementById('custom-search-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(this.customEngines).forEach(([id, engine]) => {
            const item = document.createElement('div');
            item.className = 'custom-search-item';
            
            const icon = engine.icon || 'default-icon.png';
            item.innerHTML = `
                <img src="${icon}" alt="${engine.name}" onerror="this.src='default-icon.png'">
                <div class="search-info">
                    <div class="search-name">${engine.name}</div>
                    <div class="search-url">${engine.url}?${engine.queryParam}={q}</div>
                </div>
                <div class="action-buttons">
                    <button class="action-button edit-button" data-id="${id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-button delete-button" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * 更新搜索引擎选择器
     * 更新主页面上的搜索引擎下拉选择框
     */
    updateSearchEngineSelect() {
        const optionsContainer = document.querySelector('.options-container');
        if (!optionsContainer) return;
        
        const allEngines = this.getAllEngines();
        optionsContainer.innerHTML = '';
        
        // 获取保存的搜索引擎
        const savedEngine = localStorage.getItem('preferredSearchEngine') || 'baidu';
        
        // 添加所有搜索引擎（默认 + 自定义）
        Object.entries(allEngines).forEach(([id, engine]) => {
            const option = document.createElement('div');
            option.className = 'option';
            option.setAttribute('data-value', id);
            option.setAttribute('data-icon', engine.icon || 'default-icon.png');
            option.innerHTML = `
                <img src="${engine.icon}" alt="${engine.name}" class="search-engine-icon" onerror="this.src='default-icon.png'">
                <span>${engine.name}</span>
            `;
            optionsContainer.appendChild(option);
            
            // 如果是当前选中的搜索引擎，更新显示
            if (id === savedEngine) {
                const selectedOption = document.querySelector('.selected-option');
                if (selectedOption) {
                    selectedOption.innerHTML = `
                        <img src="${engine.icon}" alt="${engine.name}" class="search-engine-icon" onerror="this.src='default-icon.png'">
                        <span class="search-engine-name">${engine.name}</span>
                        <i class="fas fa-chevron-down"></i>
                    `;
                }
            }
        });
        
        // 重新绑定点击事件
        this.initSearchEngineSelectEvents();
    }
    
    /**
     * 初始化搜索引擎选择器的事件
     */
    initSearchEngineSelectEvents() {
        const customSelect = document.querySelector('.custom-select');
        const selectedOption = document.querySelector('.selected-option');
        const optionsContainer = document.querySelector('.options-container');
        const options = document.querySelectorAll('.option');
        
        if (!customSelect || !selectedOption || !optionsContainer) return;
        
        // 点击选择器时显示/隐藏选项
        selectedOption.addEventListener('click', () => {
            optionsContainer.classList.toggle('active');
            selectedOption.classList.toggle('active');
        });
        
        // 点击选项时更新选择器
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                const icon = option.getAttribute('data-icon');
                const name = option.querySelector('span').textContent;
                
                selectedOption.innerHTML = `
                    <img src="${icon}" alt="${name}" class="search-engine-icon" onerror="this.src='default-icon.png'">
                    <span class="search-engine-name">${name}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
                
                optionsContainer.classList.remove('active');
                selectedOption.classList.remove('active');
                
                // 保存选择
                localStorage.setItem('preferredSearchEngine', value);
            });
        });
        
        // 点击其他地方时关闭选项列表
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                optionsContainer.classList.remove('active');
                selectedOption.classList.remove('active');
            }
        });
    }

    /**
     * 执行搜索
     * @param {string} searchTerm - 搜索关键词
     */
    performSearch(searchTerm) {
        if (!searchTerm) return;
        
        // 获取当前选中的搜索引擎
        const selectedEngine = localStorage.getItem('preferredSearchEngine') || 'baidu';
        const allEngines = this.getAllEngines();
        const engine = allEngines[selectedEngine];
        
        if (!engine) {
            console.error('Selected search engine not found');
            return;
        }
        
        // 构建搜索URL
        const searchUrl = `${engine.url}${engine.url.includes('?') ? '&' : '?'}${engine.queryParam}=${encodeURIComponent(searchTerm)}`;
        window.location.href = searchUrl;
    }

    /**
     * 初始化事件监听器
     * 设置搜索引擎相关的事件处理
     */
    initEventListeners() {
        // 搜索引擎选择变化时保存首选项
        const select = document.getElementById('search-engine');
        if (select) {
            select.addEventListener('change', () => {
                localStorage.setItem('preferredSearchEngine', select.value);
                this.updateSearchEngineIcon();
            });
        }

        // 添加自定义搜索引擎
        const saveButton = document.getElementById('save-custom-search');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const nameInput = document.getElementById('custom-search-name');
                const urlInput = document.getElementById('custom-search-url');
                const iconInput = document.getElementById('custom-search-icon');

                try {
                    this.addSearchEngine(
                        nameInput.value.trim(),
                        urlInput.value.trim(),
                        iconInput.value.trim()
                    );
                    // 清空输入框
                    nameInput.value = '';
                    urlInput.value = '';
                    iconInput.value = '';
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        // 删除和编辑按钮的事件委托
        const customSearchList = document.getElementById('custom-search-list');
        if (customSearchList) {
            customSearchList.addEventListener('click', (e) => {
                const button = e.target.closest('.action-button');
                if (!button) return;

                const id = button.dataset.id;
                if (button.classList.contains('delete-button')) {
                    if (confirm('确定要删除这个搜索引擎吗？')) {
                        this.deleteSearchEngine(id);
                    }
                } else if (button.classList.contains('edit-button')) {
                    const engine = this.editSearchEngine(id);
                    if (engine) {
                        document.getElementById('custom-search-name').value = engine.name;
                        document.getElementById('custom-search-url').value = `${engine.url}?${engine.queryParam}={q}`;
                        document.getElementById('custom-search-icon').value = engine.icon;
                    }
                }
            });
        }
    }
}

// 创建搜索引擎管理器实例并挂载到window对象
window.searchEngineManager = new SearchEngineManager(); 