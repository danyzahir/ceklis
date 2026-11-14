/**
 * Ceklis Kegiatan - Todo List
 * Fitur: Tambah, Hapus, Edit, Ceklis, Filter, LocalStorage
 * Responsif untuk semua ukuran layar smartphone & desktop
 */

// Data awal (7 gradasi tumpukan kapsul biru sesuai referensi visual)
const DEFAULT_TODOS = [
  { id: 'todo-1', text: 'Perencanaan target harian & review prioritas', completed: true, shade: 1 },
  { id: 'todo-2', text: 'Meeting koordinasi tim proyek', completed: true, shade: 2 },
  { id: 'todo-3', text: 'Selesaikan laporan analitik mingguan', completed: false, shade: 3 },
  { id: 'todo-4', text: 'Koding fitur baru & pengujian antarmuka', completed: false, shade: 4 },
  { id: 'todo-5', text: 'Membaca buku 20 menit', completed: false, shade: 5 },
  { id: 'todo-6', text: 'Olahraga peregangan sore', completed: false, shade: 6 },
  { id: 'todo-7', text: 'Evaluasi pencapaian hari ini', completed: false, shade: 7 }
];

class TodoApp {
  constructor() {
    this.todos = [];
    this.currentFilter = 'all';

    this.initElements();
    this.loadTodos();
    this.bindEvents();
    this.render();
  }

  initElements() {
    this.todoForm = document.getElementById('todo-form');
    this.todoInput = document.getElementById('todo-input');
    this.todoList = document.getElementById('todo-list');
    this.emptyState = document.getElementById('empty-state');
    
    // Stats & Progress
    this.progressStatus = document.getElementById('progress-status');
    this.progressPercent = document.getElementById('progress-percent');
    this.progressFill = document.getElementById('progress-fill');

    // Counts
    this.countAll = document.getElementById('count-all');
    this.countActive = document.getElementById('count-active');
    this.countCompleted = document.getElementById('count-completed');

    // Filter Buttons
    this.filterBtns = document.querySelectorAll('.filter-pill');

    // Action Buttons
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
  }

  loadTodos() {
    const saved = localStorage.getItem('ceklish_todos');
    if (saved) {
      try {
        this.todos = JSON.parse(saved);
      } catch (e) {
        this.todos = [...DEFAULT_TODOS];
      }
    } else {
      this.todos = [...DEFAULT_TODOS];
      this.saveTodos();
    }
  }

  saveTodos() {
    localStorage.setItem('ceklish_todos', JSON.stringify(this.todos));
  }

  bindEvents() {
    // Form submit to add task
    this.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo();
    });

    // Filters
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.render();
      });
    });

    // Clear completed
    this.clearCompletedBtn.addEventListener('click', () => {
      this.clearCompleted();
    });
  }

  getNextShade() {
    // Auto urutan gradasi 1..7 seperti pada foto
    const count = this.todos.length;
    return (count % 7) + 1;
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const newTodo = {
      id: 'todo-' + Date.now(),
      text: text,
      completed: false,
      shade: this.getNextShade(),
      createdAt: new Date().toISOString()
    };

    this.todos.push(newTodo);
    this.saveTodos();
    this.todoInput.value = '';
    this.render();

    // Scroll halus ke item baru
    setTimeout(() => {
      const el = document.getElementById(newTodo.id);
      if (el) {
        el.classList.add('entering');
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 40);
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    this.saveTodos();
    this.render();
  }

  deleteTodo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('exiting');
      setTimeout(() => {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
      }, 200);
    } else {
      this.todos = this.todos.filter(t => t.id !== id);
      this.saveTodos();
      this.render();
    }
  }

  startEditing(id) {
    const todoEl = document.getElementById(id);
    if (!todoEl) return;

    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    todoEl.classList.add('editing');
    const input = todoEl.querySelector('.edit-input');
    if (input) {
      input.value = todo.text;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  saveEdit(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) {
      this.deleteTodo(id);
      return;
    }

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = trimmed;
      this.saveTodos();
    }
    this.render();
  }

  cancelEdit() {
    this.render();
  }

  clearCompleted() {
    const hasCompleted = this.todos.some(t => t.completed);
    if (!hasCompleted) return;

    this.todos = this.todos.filter(t => !t.completed);
    this.saveTodos();
    this.render();
  }

  render() {
    // 1. Hitung statistik
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 2. Update Header Progress
    this.progressStatus.textContent = `${completed} dari ${total} selesai`;
    this.progressPercent.textContent = `${percent}%`;
    this.progressFill.style.width = `${percent}%`;

    this.countAll.textContent = total;
    this.countActive.textContent = active;
    this.countCompleted.textContent = completed;

    // 3. Filter Todos
    let filtered = this.todos;
    if (this.currentFilter === 'active') {
      filtered = this.todos.filter(t => !t.completed);
    } else if (this.currentFilter === 'completed') {
      filtered = this.todos.filter(t => t.completed);
    }

    // 4. Empty State
    if (filtered.length === 0) {
      this.todoList.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    } else {
      this.emptyState.classList.add('hidden');
    }

    // 5. Render Capsule List
    this.todoList.innerHTML = filtered.map((todo, index) => {
      const shade = todo.shade || ((index % 7) + 1);

      return `
        <div 
          class="todo-pill ${todo.completed ? 'completed' : ''}" 
          id="${todo.id}"
          data-shade="${shade}"
        >
          <!-- Bagian Kiri: Ceklis & Teks Kegiatan -->
          <div class="pill-content-left" onclick="todoApp.handlePillClick(event, '${todo.id}')">
            <button 
              type="button" 
              class="checkbox-btn" 
              aria-label="${todo.completed ? 'Batal selesai' : 'Tandai selesai'}"
              onclick="event.stopPropagation(); todoApp.toggleTodo('${todo.id}')"
            >
              <svg class="checkbox-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <span class="todo-text">
              ${this.escapeHtml(todo.text)}
            </span>
          </div>

          <!-- Bagian Kanan: Tombol Edit & Hapus -->
          <div class="pill-actions">
            <button 
              type="button" 
              class="pill-action-btn edit-btn" 
              title="Edit" 
              aria-label="Edit"
              onclick="event.stopPropagation(); todoApp.startEditing('${todo.id}')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button 
              type="button" 
              class="pill-action-btn delete-btn" 
              title="Hapus" 
              aria-label="Hapus"
              onclick="event.stopPropagation(); todoApp.deleteTodo('${todo.id}')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <!-- Form Edit Langsung (Inline) -->
          <form class="edit-form" onsubmit="event.preventDefault(); todoApp.handleSaveEdit('${todo.id}')">
            <input 
              type="text" 
              class="edit-input" 
              value="${this.escapeHtml(todo.text)}"
              onkeydown="if(event.key === 'Escape') todoApp.cancelEdit()"
            />
            <button type="submit" class="save-edit-btn" title="Simpan">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button type="button" class="cancel-edit-btn" title="Batal" onclick="todoApp.cancelEdit()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </form>
        </div>
      `;
    }).join('');
  }

  handlePillClick(event, id) {
    if (!event.target.closest('button') && !event.target.closest('input')) {
      this.toggleTodo(id);
    }
  }

  handleSaveEdit(id) {
    const todoEl = document.getElementById(id);
    if (!todoEl) return;
    const input = todoEl.querySelector('.edit-input');
    if (input) {
      this.saveEdit(id, input.value);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

let todoApp;
document.addEventListener('DOMContentLoaded', () => {
  todoApp = new TodoApp();
});
