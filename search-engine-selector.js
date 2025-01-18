// 搜索引擎选择器管理
(function() {
    function initializeSearchEngineSelector() {
        const customSelect = document.querySelector('.custom-select');
        const selectedOption = document.querySelector('.selected-option');
        const optionsContainer = document.querySelector('.options-container');
        
        if (!customSelect || !selectedOption || !optionsContainer) {
            console.error('搜索引擎选择器元素未找到');
            return;
        }

        // 清除可能存在的旧事件监听器
        const newCustomSelect = customSelect.cloneNode(true);
        customSelect.parentNode.replaceChild(newCustomSelect, customSelect);
        
        // 重新获取更新后的元素
        const newSelectedOption = newCustomSelect.querySelector('.selected-option');
        const options = newCustomSelect.querySelectorAll('.option');

        // 点击选择器显示/隐藏选项
        newSelectedOption.addEventListener('click', (e) => {
            e.stopPropagation();
            newCustomSelect.classList.toggle('active');
        });

        // 选择搜索引擎
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                const icon = option.getAttribute('data-icon');
                const name = option.querySelector('span').textContent;
                
                // 更新UI
                newSelectedOption.querySelector('.search-engine-icon').src = icon;
                newSelectedOption.querySelector('.search-engine-name').textContent = name;
                
                // 保存选择
                localStorage.setItem('preferredSearchEngine', value);
                
                // 关闭选项容器
                newCustomSelect.classList.remove('active');
            });
        });

        // 点击其他地方关闭选项
        document.addEventListener('click', () => {
            newCustomSelect.classList.remove('active');
        });

        // 加载保存的搜索引擎
        const savedEngine = localStorage.getItem('preferredSearchEngine') || 'baidu';
        const option = newCustomSelect.querySelector(`.option[data-value="${savedEngine}"]`);
        if (option) {
            const icon = option.getAttribute('data-icon');
            const name = option.querySelector('span').textContent;
            newSelectedOption.querySelector('.search-engine-icon').src = icon;
            newSelectedOption.querySelector('.search-engine-name').textContent = name;
        }
    }

    // 确保在DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSearchEngineSelector);
    } else {
        initializeSearchEngineSelector();
    }
})(); 