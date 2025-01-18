// 便签插件
const stickyNotesPlugin = {
    id: 'sticky-notes',
    name: '便签',
    description: '在页面上添加可拖动的便签，右键点击页面添加新便签',
    version: '1.0.0',
    author: 'Claude',
    enabled: false,
    notes: new Map(),
    contextMenu: null,

    initialize() {
        this.loadNotes();
        this.setupContextMenu();
    },

    enable() {
        this.enabled = true;
        this.setupContextMenu();
        this.showAllNotes();
        localStorage.setItem('sticky-notes-enabled', 'true');
    },

    disable() {
        this.enabled = false;
        this.removeContextMenu();
        this.hideAllNotes();
        localStorage.setItem('sticky-notes-enabled', 'false');
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    },

    setupContextMenu() {
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.addEventListener('click', this.hideContextMenu.bind(this));
    },

    removeContextMenu() {
        document.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.removeEventListener('click', this.hideContextMenu.bind(this));
        this.hideContextMenu();
    },

    handleContextMenu(event) {
        if (!this.enabled) return;
        
        event.preventDefault();
        this.showContextMenu(event.clientX, event.clientY);
    },

    showContextMenu(x, y) {
        this.hideContextMenu();

        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'sticky-note-context-menu';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="create">
                <i class="fas fa-plus"></i> 新建便签
            </div>
        `;

        document.body.appendChild(this.contextMenu);

        // 调整菜单位置，确保不超出视窗
        const menuRect = this.contextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (x + menuRect.width > windowWidth) {
            x = windowWidth - menuRect.width;
        }
        if (y + menuRect.height > windowHeight) {
            y = windowHeight - menuRect.height;
        }

        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';

        // 绑定菜单项点击事件
        this.contextMenu.querySelector('[data-action="create"]').addEventListener('click', () => {
            this.createNote(x, y);
            this.hideContextMenu();
        });
    },

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    },

    createNote(x, y) {
        const noteId = 'note-' + Date.now();
        const note = document.createElement('div');
        note.className = 'sticky-note';
        note.id = noteId;
        note.style.left = x + 'px';
        note.style.top = y + 'px';

        note.innerHTML = `
            <div class="sticky-note-header">
                <button class="sticky-note-btn lock-btn" title="锁定/解锁">🔓</button>
                <button class="sticky-note-btn delete-btn" title="删除">×</button>
            </div>
            <textarea class="sticky-note-content" placeholder="在此输入内容..."></textarea>
        `;

        document.body.appendChild(note);
        this.notes.set(noteId, {
            x,
            y,
            content: '',
            locked: false
        });

        this.setupNoteEvents(note);
        this.saveNotes();
    },

    setupNoteEvents(note) {
        const header = note.querySelector('.sticky-note-header');
        const textarea = note.querySelector('.sticky-note-content');
        const lockBtn = note.querySelector('.lock-btn');
        const deleteBtn = note.querySelector('.delete-btn');
        let isDragging = false;
        let startX, startY, initialX, initialY;

        // 拖动功能
        header.addEventListener('mousedown', (e) => {
            if (note.classList.contains('locked')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = note.offsetLeft;
            initialY = note.offsetTop;

            const mouseMoveHandler = (e) => {
                if (!isDragging) return;
                
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                note.style.left = initialX + dx + 'px';
                note.style.top = initialY + dy + 'px';
            };

            const mouseUpHandler = () => {
                isDragging = false;
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
                
                // 保存位置
                const noteData = this.notes.get(note.id);
                if (noteData) {
                    noteData.x = note.offsetLeft;
                    noteData.y = note.offsetTop;
                    this.saveNotes();
                }
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });

        // 内容更新
        textarea.addEventListener('input', () => {
            const noteData = this.notes.get(note.id);
            if (noteData) {
                noteData.content = textarea.value;
                this.saveNotes();
            }
        });

        // 锁定/解锁
        lockBtn.addEventListener('click', () => {
            const noteData = this.notes.get(note.id);
            if (noteData) {
                noteData.locked = !noteData.locked;
                note.classList.toggle('locked');
                lockBtn.textContent = noteData.locked ? '🔒' : '🔓';
                this.saveNotes();
            }
        });

        // 删除
        deleteBtn.addEventListener('click', () => {
            note.remove();
            this.notes.delete(note.id);
            this.saveNotes();
        });
    },

    loadNotes() {
        try {
            const savedNotes = JSON.parse(localStorage.getItem('sticky-notes')) || {};
            this.notes = new Map(Object.entries(savedNotes));
            
            // 检查是否之前启用
            const wasEnabled = localStorage.getItem('sticky-notes-enabled') === 'true';
            if (wasEnabled) {
                this.enable();
            }

            // 创建已保存的便签
            for (const [id, data] of this.notes) {
                const note = document.createElement('div');
                note.className = 'sticky-note' + (data.locked ? ' locked' : '');
                note.id = id;
                note.style.left = data.x + 'px';
                note.style.top = data.y + 'px';

                note.innerHTML = `
                    <div class="sticky-note-header">
                        <button class="sticky-note-btn lock-btn" title="锁定/解锁">
                            ${data.locked ? '🔒' : '🔓'}
                        </button>
                        <button class="sticky-note-btn delete-btn" title="删除">×</button>
                    </div>
                    <textarea class="sticky-note-content" placeholder="在此输入内容...">${data.content || ''}</textarea>
                `;

                document.body.appendChild(note);
                this.setupNoteEvents(note);
            }
        } catch (error) {
            console.error('加载便签失败:', error);
        }
    },

    saveNotes() {
        const notesObj = Object.fromEntries(this.notes);
        localStorage.setItem('sticky-notes', JSON.stringify(notesObj));
    },

    showAllNotes() {
        document.querySelectorAll('.sticky-note').forEach(note => {
            note.style.display = 'flex';
        });
    },

    hideAllNotes() {
        document.querySelectorAll('.sticky-note').forEach(note => {
            note.style.display = 'none';
        });
    }
};

// 返回插件对象
return stickyNotesPlugin; 