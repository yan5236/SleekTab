// 便签插件
export default {
    id: 'sticky-notes',
    name: '便签',
    description: '在页面上添加可拖动的便签',
    version: '1.0.0',
    author: 'SleekTab',

    data: {
        notes: [],
        contextMenu: null
    },

    // 初始化插件
    async init() {
        this.data.notes = JSON.parse(localStorage.getItem('stickyNotes') || '[]');
        
        // 添加右键菜单事件监听
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        document.addEventListener('click', this.removeContextMenu.bind(this));

        // 如果插件已启用，加载便签
        if (this.isEnabled()) {
            this.loadNotes();
        }
    },

    // 启用插件
    enable() {
        localStorage.setItem('enableStickyNotes', 'true');
        this.loadNotes();
    },

    // 禁用插件
    disable() {
        localStorage.setItem('enableStickyNotes', 'false');
        this.removeAllNotes();
    },

    // 检查插件是否启用
    isEnabled() {
        return localStorage.getItem('enableStickyNotes') !== 'false';
    },

    // 处理右键菜单
    handleContextMenu(e) {
        if (!this.isEnabled()) return;
        
        // 检查是否点击在便签上
        let target = e.target;
        while (target) {
            if (target.classList && target.classList.contains('sticky-note')) {
                return;
            }
            target = target.parentElement;
        }

        e.preventDefault();
        this.createContextMenu(e.clientX, e.clientY);
    },

    // 创建右键菜单
    createContextMenu(x, y) {
        this.removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;

        const addNoteItem = document.createElement('div');
        addNoteItem.className = 'context-menu-item';
        addNoteItem.textContent = '添加便签';
        addNoteItem.onclick = () => {
            this.createNote(x, y);
            this.removeContextMenu();
        };

        menu.appendChild(addNoteItem);
        document.body.appendChild(menu);
        this.data.contextMenu = menu;
    },

    // 移除右键菜单
    removeContextMenu() {
        if (this.data.contextMenu) {
            document.body.removeChild(this.data.contextMenu);
            this.data.contextMenu = null;
        }
    },

    // 创建便签
    createNote(x, y, noteData = null) {
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
                this.saveNotes();
            }
        });

        // 锁定功能
        lockBtn.addEventListener('click', () => {
            note.classList.toggle('locked');
            content.readOnly = note.classList.contains('locked');
            lockBtn.innerHTML = note.classList.contains('locked') ? 
                '<i class="fas fa-lock"></i>' : 
                '<i class="fas fa-lock-open"></i>';
            this.saveNotes();
        });

        // 删除功能
        deleteBtn.addEventListener('click', () => {
            document.body.removeChild(note);
            this.saveNotes();
        });

        // 内容变化时保存
        content.addEventListener('input', () => this.saveNotes());

        // 如果是已锁定的便签，设置锁定状态
        if (noteData && noteData.locked) {
            note.classList.add('locked');
            content.readOnly = true;
            lockBtn.innerHTML = '<i class="fas fa-lock"></i>';
        }

        document.body.appendChild(note);
        this.saveNotes();
    },

    // 保存便签数据
    saveNotes() {
        const notes = Array.from(document.querySelectorAll('.sticky-note')).map(note => ({
            x: parseInt(note.style.left),
            y: parseInt(note.style.top),
            width: note.style.width,
            height: note.style.height,
            content: note.querySelector('.sticky-note-content').value,
            locked: note.classList.contains('locked')
        }));
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
        this.data.notes = notes;
    },

    // 加载便签
    loadNotes() {
        this.data.notes.forEach(noteData => {
            this.createNote(0, 0, noteData);
        });
    },

    // 移除所有便签
    removeAllNotes() {
        document.querySelectorAll('.sticky-note').forEach(note => {
            document.body.removeChild(note);
        });
    }
}; 