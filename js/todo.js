import { TaskList } from './components/TaskList.js';
import { TaskForm } from './components/TaskForm.js';
import { TaskFilters } from './components/TaskFilters.js';

const username = checkAuth();
if (!username) {
  throw new Error('Authentication required');
}

let tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || [];
let darkMode = localStorage.getItem('darkMode') === 'enabled';

// Initialize components
const taskList = new TaskList(document.getElementById('taskList'), {
  itemsPerPage: 10,
  onStatusChange: (task, index) => {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  },
  onEdit: (task, index) => {
    showEditForm(task, index);
  },
  onDelete: (task, index) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(index);
    }
  }
});

const taskForm = new TaskForm(document.getElementById('taskFormContainer'), {
  onSubmit: (task) => {
    addTask(task);
  },
  categories: getUniqueCategories()
});

const taskFilters = new TaskFilters(document.getElementById('taskFiltersContainer'), {
  onFilter: (filters) => {
    currentFilters = filters;
    renderTasks();
  },
  categories: getUniqueCategories()
});

// Dark mode functions
function toggleDarkMode(enable) {
  document.documentElement.classList.toggle('dark', enable);
  localStorage.setItem('darkMode', enable ? 'enabled' : null);
  darkMode = enable;
}

// Initialize dark mode
toggleDarkMode(darkMode);

// Task management
function saveTasks() {
  localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
  updateCategories();
}

function addTask(task) {
  tasks.push(task);
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function showEditForm(task, index) {
  const dialog = document.createElement('dialog');
  dialog.className = 'p-4 rounded-lg shadow-xl dark:bg-gray-800';
  
  dialog.innerHTML = `
    <form method="dialog" class="space-y-4">
      <h2 class="text-xl font-bold mb-4">Edit Task</h2>
      <div class="space-y-4">
        <input type="text" name="text" value="${task.text}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        <select name="priority" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
          <option value="Thấp" ${task.priority === 'Thấp' ? 'selected' : ''}>Low</option>
          <option value="Trung bình" ${task.priority === 'Trung bình' ? 'selected' : ''}>Medium</option>
          <option value="Cao" ${task.priority === 'Cao' ? 'selected' : ''}>High</option>
        </select>
        <input type="date" name="startDate" value="${task.startDate}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        <input type="date" name="endDate" value="${task.endDate}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        <input type="text" name="category" value="${task.category}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
      </div>
      <div class="flex justify-end space-x-2 mt-4">
        <button type="button" class="px-4 py-2 bg-gray-500 text-white rounded" onclick="this.closest('dialog').close()">
          Cancel
        </button>
        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">
          Save
        </button>
      </div>
    </form>
  `;

  dialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    tasks[index] = {
      ...tasks[index],
      text: DOMPurify.sanitize(formData.get('text')),
      priority: formData.get('priority'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      category: DOMPurify.sanitize(formData.get('category'))
    };
    
    saveTasks();
    renderTasks();
    dialog.close();
  });

  document.body.appendChild(dialog);
  dialog.showModal();
}

function getUniqueCategories() {
  return [...new Set(tasks.map(task => task.category).filter(Boolean))];
}

function updateCategories() {
  const categories = getUniqueCategories();
  taskForm.updateCategories(categories);
  taskFilters.updateCategories(categories);
}

function renderTasks() {
  taskList.render(tasks, currentFilters);
}

// Event listeners
document.getElementById('darkModeToggle')?.addEventListener('click', () => {
  toggleDarkMode(!darkMode);
});

// Initialize
let currentFilters = {};
renderTasks();