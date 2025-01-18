// 附加功能管理器
class AddonManager {
    constructor() {
        this.addons = new Map();
        this.installedPlugins = new Set();
        this.loadInstalledPlugins();
    }

    // 加载已安装的插件
    async loadInstalledPlugins() {
        try {
            const installedPlugins = JSON.parse(localStorage.getItem('installedPlugins')) || [];
            for (const pluginData of installedPlugins) {
                const { code, styleCode } = pluginData;
                await this.installPlugin(code, styleCode);
            }
            this.updateSettingsUI();
        } catch (error) {
            console.error('加载插件失败:', error);
        }
    }

    // 验证插件格式
    validatePlugin(plugin) {
        const requiredProps = ['id', 'name', 'description', 'version'];
        return requiredProps.every(prop => plugin.hasOwnProperty(prop));
    }

    // 安装新插件
    async installPlugin(code, styleCode) {
        try {
            const plugin = new Function(code)();
            
            if (!this.validatePlugin(plugin)) {
                throw new Error('插件格式无效');
            }

            if (this.addons.has(plugin.id)) {
                throw new Error('插件已存在');
            }

            // 添加插件样式
            if (styleCode) {
                const styleElement = document.createElement('style');
                styleElement.textContent = styleCode;
                styleElement.setAttribute('data-plugin-id', plugin.id);
                document.head.appendChild(styleElement);
            }

            this.addons.set(plugin.id, plugin);
            this.installedPlugins.add(plugin.id);

            // 保存到 localStorage
            const installedPlugins = Array.from(this.installedPlugins).map(id => {
                const plugin = this.addons.get(id);
                return {
                    id,
                    code: code,
                    styleCode: styleCode
                };
            });
            localStorage.setItem('installedPlugins', JSON.stringify(installedPlugins));

            if (plugin.initialize) {
                await plugin.initialize();
            }

            this.updateSettingsUI();
            return true;
        } catch (error) {
            console.error('安装插件失败:', error);
            return false;
        }
    }

    // 卸载插件
    uninstallPlugin(pluginId) {
        const plugin = this.addons.get(pluginId);
        if (!plugin) return false;

        // 移除插件样式
        const styleElement = document.querySelector(`style[data-plugin-id="${pluginId}"]`);
        if (styleElement) {
            styleElement.remove();
        }

        if (plugin.disable) {
            plugin.disable();
        }

        this.addons.delete(pluginId);
        this.installedPlugins.delete(pluginId);

        // 更新 localStorage
        const installedPlugins = Array.from(this.installedPlugins).map(id => {
            const plugin = this.addons.get(id);
            return {
                id,
                code: plugin.code,
                styleCode: plugin.styleCode
            };
        });
        localStorage.setItem('installedPlugins', JSON.stringify(installedPlugins));

        this.updateSettingsUI();
        return true;
    }

    // 更新设置页面中的附加功能列表
    updateSettingsUI() {
        const settingsContainer = document.querySelector('.modal-body');
        if (!settingsContainer) return;

        // 移除所有旧的附加功能部分
        const oldAddonSections = settingsContainer.querySelectorAll('.addon-section');
        oldAddonSections.forEach(section => section.remove());

        // 创建新的附加功能部分
        const addonSection = document.createElement('div');
        addonSection.className = 'addon-section';
        addonSection.innerHTML = `
            <h3 class="settings-title">附加功能</h3>
            <div class="addon-list"></div>
            <div class="settings-section custom-search-engine">
                <div class="settings-row">
                    <label>插件代码</label>
                    <textarea class="plugin-code-input" placeholder="在此粘贴插件代码..."></textarea>
                </div>
                <div class="settings-row">
                    <label>样式代码（可选）</label>
                    <textarea class="plugin-style-input" placeholder="在此粘贴插件样式代码..."></textarea>
                </div>
                <div class="settings-row">
                    <button class="primary-button install-plugin-btn">
                        <i class="fas fa-plus"></i> 安装插件
                    </button>
                </div>
            </div>
        `;

        const addonList = addonSection.querySelector('.addon-list');
        addonList.innerHTML = '';

        if (this.installedPlugins.size === 0) {
            addonList.innerHTML = '<div class="empty-plugins-message">暂无已安装的插件</div>';
        } else {
            for (const [id, plugin] of this.addons) {
                const addonItem = document.createElement('div');
                addonItem.className = 'addon-item';
                addonItem.innerHTML = `
                    <div class="addon-info">
                        <h4>${plugin.name} v${plugin.version}</h4>
                        <p>${plugin.description}</p>
                        ${plugin.author ? `<small>作者: ${plugin.author}</small>` : ''}
                    </div>
                    <div class="addon-controls">
                        <div class="toggle-switch">
                            <input type="checkbox" id="toggle-${id}" ${plugin.enabled ? 'checked' : ''}>
                            <label class="toggle-label" for="toggle-${id}">
                                <span class="toggle-button"></span>
                            </label>
                        </div>
                        <button class="uninstall-btn" data-plugin-id="${id}">卸载</button>
                    </div>
                `;
                addonList.appendChild(addonItem);

                // 绑定开关事件
                const toggle = addonItem.querySelector(`#toggle-${id}`);
                toggle.addEventListener('change', () => {
                    if (toggle.checked) {
                        this.enableAddon(id);
                    } else {
                        this.disableAddon(id);
                    }
                });

                // 绑定卸载按钮事件
                const uninstallBtn = addonItem.querySelector('.uninstall-btn');
                uninstallBtn.addEventListener('click', () => {
                    if (confirm('确定要卸载此插件吗？')) {
                        this.uninstallPlugin(id);
                    }
                });
            }
        }

        settingsContainer.appendChild(addonSection);

        // 绑定安装按钮事件
        const installBtn = addonSection.querySelector('.install-plugin-btn');
        const codeInput = addonSection.querySelector('.plugin-code-input');
        const styleInput = addonSection.querySelector('.plugin-style-input');
        
        installBtn.addEventListener('click', async () => {
            const code = codeInput.value.trim();
            const styleCode = styleInput.value.trim();
            
            if (!code) {
                alert('请输入插件代码');
                return;
            }

            const success = await this.installPlugin(code, styleCode);
            if (success) {
                codeInput.value = '';
                styleInput.value = '';
                alert('插件安装成功！');
            } else {
                alert('插件安装失败，请检查代码格式是否正确。');
            }
        });
    }

    // 启用附加功能
    enableAddon(id) {
        const addon = this.addons.get(id);
        if (addon && addon.enable) {
            addon.enable();
            addon.enabled = true;
        }
    }

    // 禁用附加功能
    disableAddon(id) {
        const addon = this.addons.get(id);
        if (addon && addon.disable) {
            addon.disable();
            addon.enabled = false;
        }
    }
}

// 初始化插件管理器
const addonManager = new AddonManager(); 