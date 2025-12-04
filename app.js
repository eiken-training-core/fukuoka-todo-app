// タスクを管理するクラス
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.form = document.getElementById('todo-form');
        this.taskInput = document.getElementById('task-input');
        this.deadlineInput = document.getElementById('deadline-input');
        this.taskList = document.getElementById('task-list');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.render();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const taskText = this.taskInput.value.trim();
        const deadline = this.deadlineInput.value;
        
        if (taskText) {
            this.addTask(taskText, deadline);
            this.taskInput.value = '';
            this.deadlineInput.value = '';
        }
    }

    addTask(text, deadline) {
        const task = {
            id: Date.now(),
            text: text,
            deadline: deadline || null,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.render();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    getDeadlineStatus(deadline) {
        if (!deadline) return null;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays === 0) {
            return 'today';
        } else {
            return 'upcoming';
        }
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        const date = new Date(deadline);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        return `${year}年${month}月${day}日`;
    }

    render() {
        this.taskList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            this.taskList.innerHTML = '<div class="empty-state">タスクがありません</div>';
            return;
        }
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            const deadlineStatus = this.getDeadlineStatus(task.deadline);
            const deadlineHTML = task.deadline 
                ? `<div class="task-deadline ${deadlineStatus}">
                     期限: ${this.formatDeadline(task.deadline)}
                   </div>`
                : '';
            
            li.innerHTML = `
                <div class="task-left">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        data-id="${task.id}"
                    >
                    <div class="task-info">
                        <div class="task-content">${this.escapeHtml(task.text)}</div>
                        ${deadlineHTML}
                    </div>
                </div>
                <button class="btn-delete" data-id="${task.id}">削除</button>
            `;
            
            this.taskList.appendChild(li);
        });
        
        // イベントリスナーを追加
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(parseInt(e.target.dataset.id));
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                this.deleteTask(parseInt(e.target.dataset.id));
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('todos', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('todos');
        return saved ? JSON.parse(saved) : [];
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
