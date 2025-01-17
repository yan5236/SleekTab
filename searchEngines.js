// 默认搜索引擎配置
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

// 搜索引擎管理类
class SearchEngineManager {
    constructor() {
        this.loadCustomEngines();
        this.initEventListeners();
    }

    // 加载自定义搜索引擎
    loadCustomEngines() {
        this.customEngines = JSON.parse(localStorage.getItem('customSearchEngines') || '{}');
        this.updateUI();
    }

    // 获取所有搜索引擎
    getAllEngines() {
        return { ...defaultSearchEngines, ...this.customEngines };
    }

    // 添加搜索引擎
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

    // 编辑搜索引擎
    editSearchEngine(id) {
        const engine = this.customEngines[id];
        if (!engine) return null;
        
        delete this.customEngines[id];
        this.saveCustomEngines();
        this.updateUI();
        
        return engine;
    }

    // 删除搜索引擎
    deleteSearchEngine(id) {
        if (!this.customEngines[id]) return false;
        
        delete this.customEngines[id];
        this.saveCustomEngines();
        this.updateUI();
        return true;
    }

    // 保存自定义搜索引擎到localStorage
    saveCustomEngines() {
        localStorage.setItem('customSearchEngines', JSON.stringify(this.customEngines));
    }

    // 更新UI
    updateUI() {
        this.updateSearchEngineList();
        this.updateSearchEngineSelect();
    }

    // 更新搜索引擎列表
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

    // 更新搜索引擎选择器
    updateSearchEngineSelect() {
        const select = document.getElementById('search-engine');
        if (!select) return;
        
        const allEngines = this.getAllEngines();
        select.innerHTML = '';
        
        Object.entries(allEngines).forEach(([id, engine]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = engine.name;
            option.setAttribute('data-icon', engine.icon || 'default-icon.png');
            select.appendChild(option);
        });

        // 设置选中的搜索引擎
        const savedEngine = localStorage.getItem('preferredSearchEngine') || 'baidu';
        if (allEngines[savedEngine]) {
            select.value = savedEngine;
        } else {
            select.value = 'baidu';
        }
        
        this.updateSearchEngineIcon();
    }

    // 更新搜索引擎图标
    updateSearchEngineIcon() {
        const select = document.getElementById('search-engine');
        if (!select) return;
        
        const selectedOption = select.options[select.selectedIndex];
        if (!selectedOption) return;
        
        const iconUrl = selectedOption.getAttribute('data-icon');
        if (!iconUrl) return;
        
        const arrowColor = document.body.classList.contains('dark-theme') ? '%23fff' : '%23666';
        const arrowSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${arrowColor}' d='M6 8.825L1.175 4 2.238 2.938 6 6.7l3.763-3.763L10.825 4z'/%3E%3C/svg%3E")`;
        
        select.style.backgroundImage = `url('${iconUrl}'), ${arrowSvg}`;
    }

    // 执行搜索
    performSearch(searchTerm) {
        if (!searchTerm) return;

        const select = document.getElementById('search-engine');
        const selectedEngine = select.value;
        const allEngines = this.getAllEngines();
        const engine = allEngines[selectedEngine];
        
        if (!engine) {
            throw new Error('请选择有效的搜索引擎！');
        }

        const searchUrl = `${engine.url}?${engine.queryParam}=${encodeURIComponent(searchTerm)}`;
        window.location.href = searchUrl;
    }

    // 初始化事件监听
    initEventListeners() {
        // 添加搜索引擎按钮点击事件
        const saveButton = document.getElementById('save-custom-search');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                try {
                    const name = document.getElementById('custom-search-name').value.trim();
                    const url = document.getElementById('custom-search-url').value.trim();
                    const icon = document.getElementById('custom-search-icon').value.trim();
                    
                    this.addSearchEngine(name, url, icon);
                    
                    // 清空输入框
                    document.getElementById('custom-search-name').value = '';
                    document.getElementById('custom-search-url').value = '';
                    document.getElementById('custom-search-icon').value = '';
                    
                    alert('搜索引擎添加成功！');
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        // 搜索引擎列表的编辑和删除按钮点击事件
        const searchEngineList = document.getElementById('custom-search-list');
        if (searchEngineList) {
            searchEngineList.addEventListener('click', (e) => {
                const button = e.target.closest('.action-button');
                if (!button) return;

                const id = button.dataset.id;
                if (!id) return;

                if (button.classList.contains('edit-button')) {
                    const engine = this.editSearchEngine(id);
                    if (engine) {
                        document.getElementById('custom-search-name').value = engine.name;
                        document.getElementById('custom-search-url').value = `${engine.url}?${engine.queryParam}={q}`;
                        document.getElementById('custom-search-icon').value = engine.icon || '';
                    }
                } else if (button.classList.contains('delete-button')) {
                    if (confirm('确定要删除这个搜索引擎吗？')) {
                        this.deleteSearchEngine(id);
                    }
                }
            });
        }

        // 搜索引擎选择器变化事件
        const searchEngineSelect = document.getElementById('search-engine');
        if (searchEngineSelect) {
            searchEngineSelect.addEventListener('change', (e) => {
                localStorage.setItem('preferredSearchEngine', e.target.value);
                this.updateSearchEngineIcon();
            });
        }

        // 搜索按钮点击事件
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                try {
                    this.performSearch(searchInput.value.trim());
                } catch (error) {
                    alert(error.message);
                }
            });

            // 回车键搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    try {
                        this.performSearch(searchInput.value.trim());
                    } catch (error) {
                        alert(error.message);
                    }
                }
            });
        }
    }
}

// 创建搜索引擎管理器实例
document.addEventListener('DOMContentLoaded', () => {
    window.searchEngineManager = new SearchEngineManager();
}); 