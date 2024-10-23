const username = checkAuth();
if (!username) {
  throw new Error('Authentication required');
}

const taskList = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const searchInput = document.getElementById('searchInput');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeCheckbox = document.getElementById('darkModeCheckbox');

let tasks = JSON.parse(localStorage.getItem(`tasks_${username}`)) || [];
let darkMode = localStorage.getItem('darkMode') === 'enabled';
let editingIndex = -1;

// Dark mode functions
function toggleDarkMode(enable) {
  document.documentElement.classList.toggle('dark', enable);
  localStorage.setItem('darkMode', enable ? 'enabled' : null);
  darkMode = enable;
  if (darkModeCheckbox) darkModeCheckbox.checked = enable;
}

// Initialize dark mode
toggleDarkMode(darkMode);

// Event listeners for dark mode
darkModeToggle?.addEventListener('click', () => toggleDarkMode(!darkMode));
darkModeCheckbox?.addEventListener('change', (e) => toggleDarkMode(e.target.checked));

// Task management
function saveTasks() {
  localStorage.setItem(`tasks_${username}`, JSON.stringify(tasks));
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

function toggleTaskStatus(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function showEditForm(index) {
  editingIndex = index;
  const task = tasks[index];
  const listItem = taskList.children[index];

  listItem.innerHTML = `
    <form onsubmit="saveEdit(event, ${index})" class="w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="text" value="${task.text}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" required>
        <select name="priority" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
          <option value="Thấp" ${task.priority === 'Thấp' ? 'selected' : ''}>Thấp</option>
          <option value="Trung bình" ${task.priority === 'Trung bình' ? 'selected' : ''}>Trung bình</option>
          <option value="Cao" ${task.priority === 'Cao' ? 'selected' : ''}>Cao</option>
        </select>
        <input type="date" name="startDate" value="${task.startDate}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        <input type="date" name="endDate" value="${task.endDate}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        <input type="text" name="category" value="${task.category}" 
               class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
        <div class="flex space-x-2">
          <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Lưu
          </button>
          <button type="button" onclick="cancelEdit()" 
                  class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Hủy
          </button>
        </div>
      </div>
    </form>
  `;
}

function saveEdit(event, index) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  
  tasks[index] = {
    ...tasks[index],
    text: formData.get('text'),
    priority: formData.get('priority'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    category: formData.get('category')
  };
  
  editingIndex = -1;
  saveTasks();
  renderTasks();
}

function cancelEdit() {
  editingIndex = -1;
  renderTasks();
}

function filterTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  const statusFilter = filterStatus.value;
  const categoryFilter = filterCategory.value;

  return tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && task.completed) || 
      (statusFilter === 'incomplete' && !task.completed);
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });
}

function renderTasks() {
  const filteredTasks = filterTasks();
  const categories = new Set(tasks.map(task => task.category));
  
  // Update category filter
  filterCategory.innerHTML = '<option value="all">Tất cả danh mục</option>' +
    Array.from(categories)
      .filter(Boolean)
      .map(category => `<option value="${category}">${category}</option>`)
      .join('');

  // Render tasks
  taskList.innerHTML = filteredTasks.map((task, index) => `
    <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 ${task.completed ? 'opacity-50' : ''}">
      <div class="flex items-center space-x-2">
        <input type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="toggleTaskStatus(${index})" 
               class="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400">
        <span class="text-lg font-semibold ${task.completed ? 'line-through' : ''}">${task.text}</span>
      </div>
      <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <span class="text-sm ${getPriorityColor(task.priority)}">${task.priority}</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">${task.startDate} - ${task.endDate}</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">${task.category}</span>
        <button onclick="showEditForm(${index})" class="text-blue-500 hover:text-blue-700">Sửa</button>
        <button onclick="deleteTask(${index})" class="text-red-500 hover:text-red-700">Xóa</button>
      </div>
    </li>
  `).join('');
}

function getPriorityColor(priority) {
  const colors = {
    'Cao': 'text-red-500 dark:text-red-400',
    'Trung bình': 'text-yellow-500 dark:text-yellow-400',
    'Thấp': 'text-green-500 dark:text-green-400'
  };
  return colors[priority] || 'text-gray-500 dark:text-gray-400';
}

// Event listeners
addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newTask = {
    text: formData.get('taskInput'),
    completed: false,
    priority: formData.get('priority'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    category: formData.get('category')
  };
  
  if (newTask.text.trim()) {
    addTask(newTask);
    e.target.reset();
  }
});

['input', 'change'].forEach(event => {
  [searchInput, filterPriority, filterStatus, filterCategory].forEach(element => {
    element?.addEventListener(event, renderTasks);
  });
});

// Initialize
renderTasks();
