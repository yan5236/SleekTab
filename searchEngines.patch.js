// 修复搜索引擎选择和搜索功能
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // 确保搜索引擎管理器已经初始化
        if (!window.searchEngineManager) {
            console.error('搜索引擎管理器未初始化');
            return;
        }

        // 重写搜索功能
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            if (!searchTerm) return;
            window.searchEngineManager.performSearch(searchTerm);
        }

        // 绑定搜索事件
        if (searchButton) {
            searchButton.addEventListener('click', performSearch);
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // 修复搜索引擎选择器
        const customSelect = document.querySelector('.custom-select');
        const selectedOption = document.querySelector('.selected-option');
        const optionsContainer = document.querySelector('.options-container');
        const options = document.querySelectorAll('.option');

        if (customSelect && selectedOption && optionsContainer && options) {
            // 点击选择器显示/隐藏选项
            selectedOption.addEventListener('click', () => {
                customSelect.classList.toggle('active');
            });

            // 选择搜索引擎
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.getAttribute('data-value');
                    const icon = option.getAttribute('data-icon');
                    const name = option.querySelector('span').textContent;
                    
                    // 更新UI
                    selectedOption.querySelector('.search-engine-icon').src = icon;
                    selectedOption.querySelector('.search-engine-name').textContent = name;
                    
                    // 保存选择
                    localStorage.setItem('preferredSearchEngine', value);
                    
                    // 关闭选项容器
                    customSelect.classList.remove('active');
                });
            });

            // 点击其他地方关闭选项
            document.addEventListener('click', (e) => {
                if (!customSelect.contains(e.target)) {
                    customSelect.classList.remove('active');
                }
            });

            // 加载保存的搜索引擎
            const savedEngine = localStorage.getItem('preferredSearchEngine') || 'baidu';
            const option = document.querySelector(`.option[data-value="${savedEngine}"]`);
            if (option) {
                const icon = option.getAttribute('data-icon');
                const name = option.querySelector('span').textContent;
                selectedOption.querySelector('.search-engine-icon').src = icon;
                selectedOption.querySelector('.search-engine-name').textContent = name;
            }
        }
    });
})(); 