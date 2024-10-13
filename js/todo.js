const taskList = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const searchInput = document.getElementById('searchInput');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeCheckbox = document.getElementById('darkModeCheckbox');

// Menu elements
const menuHome = document.getElementById('menuHome');
const menuStats = document.getElementById('menuStats');
const menuSettings = document.getElementById('menuSettings');
const mainContent = document.getElementById('mainContent');
const statsContent = document.getElementById('statsContent');
const settingsContent = document.getElementById('settingsContent');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let darkMode = localStorage.getItem('darkMode') === 'enabled';
let categories = new Set();

// Dark mode functions
function enableDarkMode() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('darkMode', 'enabled');
  darkMode = true;
  updateDarkModeStyles();
  if (darkModeCheckbox) darkModeCheckbox.checked = true;
}

function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('darkMode', null);
  darkMode = false;
  updateDarkModeStyles();
  if (darkModeCheckbox) darkModeCheckbox.checked = false;
}

function updateDarkModeStyles() {
  const isDark = document.documentElement.classList.contains('dark');
  document.body.style.backgroundColor = isDark ? '#121212' : '';
  document.body.style.color = isDark ? '#e0e0e0' : '';
}

// Check user preference and set initial mode
if (darkMode) {
  enableDarkMode();
} else {
  disableDarkMode();
}

darkModeToggle.addEventListener('click', () => {
  darkMode ? disableDarkMode() : enableDarkMode();
});

if (darkModeCheckbox) {
  darkModeCheckbox.addEventListener('change', (e) => {
    e.target.checked ? enableDarkMode() : disableDarkMode();
  });
}

// Menu functions
function showHome() {
  mainContent.classList.remove('hidden');
  statsContent.classList.add('hidden');
  settingsContent.classList.add('hidden');
}

function showStats() {
  mainContent.classList.add('hidden');
  statsContent.classList.remove('hidden');
  settingsContent.classList.add('hidden');
  updateStats();
}

function showSettings() {
  mainContent.classList.add('hidden');
  statsContent.classList.add('hidden');
  settingsContent.classList.remove('hidden');
}

menuHome.addEventListener('click', showHome);
menuStats.addEventListener('click', showStats);
menuSettings.addEventListener('click', showSettings);

function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const incompleteTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(task => task.priority === 'Cao').length;

  document.getElementById('totalTasks').textContent = `Tổng số công việc: ${totalTasks}`;
  document.getElementById('completedTasks').textContent = `Công việc đã hoàn thành: ${completedTasks}`;
  document.getElementById('incompleteTasks').textContent = `Công việc chưa hoàn thành: ${incompleteTasks}`;
  document.getElementById('highPriorityTasks').textContent = `Công việc ưu tiên cao: ${highPriorityTasks}`;
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

function editTask(index) {
  const task = tasks[index];
  const listItem = taskList.children[index];

  listItem.innerHTML = `
    <form class="edit-form flex flex-col space-y-2">
      <input type="text" class="edit-input px-2 py-1 border rounded dark:bg-gray-700 dark:text-white" value="${task.text}">
      <select class="edit-priority px-2 py-1 border rounded dark:bg-gray-700 dark:text-white">
        <option value="Thấp" ${task.priority === 'Thấp' ? 'selected' : ''}>Thấp</option>
        <option value="Trung bình" ${task.priority === 'Trung bình' ? 'selected' : ''}>Trung bình</option>
        <option value="Cao" ${task.priority === 'Cao' ? 'selected' : ''}>Cao</option>
      </select>
      <input type="date" class="edit-start-date px-2 py-1 border rounded dark:bg-gray-700 dark:text-white" value="${task.startDate}">
      <input type="date" class="edit-end-date px-2 py-1 border rounded dark:bg-gray-700 dark:text-white" value="${task.endDate}">
      <input type="text" class="edit-category px-2 py-1 border rounded dark:bg-gray-700 dark:text-white" value="${task.category}">
      <div class="flex space-x-2">
        <button type="submit" class="save-btn bg-green-500 text-white px-2 py-1 rounded">Lưu</button>
        <button type="button" class="cancel-btn bg-red-500 text-white px-2 py-1 rounded">Hủy</button>
      </div>
    </form>
  `;

  const editForm = listItem.querySelector('.edit-form');
  const cancelBtn = listItem.querySelector('.cancel-btn');

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newText = listItem.querySelector('.edit-input').value;
    const newPriority = listItem.querySelector('.edit-priority').value;
    const newStartDate = listItem.querySelector('.edit-start-date').value;
    const newEndDate = listItem.querySelector('.edit-end-date').value;
    const newCategory = listItem.querySelector('.edit-category').value;

    task.text = newText;
    task.priority = newPriority;
    task.startDate = newStartDate;
    task.endDate = newEndDate;
    task.category = newCategory;

    saveTasks();
    renderTasks();
  });

  cancelBtn.addEventListener('click', () => {
    renderTasks();
  });
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  const filteredTasks = filterTasks();

  filteredTasks.forEach((task, index) => {
    const listItem = document.createElement('li');
    listItem.className = `bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 ${task.completed ? 'opacity-50' : ''}`;
    
    listItem.innerHTML = `
      <div class="flex items-center space-x-2">
        <input type="checkbox" ${task.completed ? 'checked' : ''} class="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400">
        <span class="text-lg font-semibold ${task.completed ? 'line-through' : ''}">${task.text}</span>
      </div>
      <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
        <span class="text-sm ${getPriorityColor(task.priority)}">${task.priority}</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">${task.startDate} - ${task.endDate}</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">${task.category}</span>
        <button class="edit-btn text-blue-500 hover:text-blue-700">Sửa</button>
        <button class="delete-btn text-red-500 hover:text-red-700">Xóa</button>
      </div>
    `;

    const checkbox = listItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => toggleTaskStatus(index));

    const deleteBtn = listItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(index));

    const editBtn = listItem.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editTask(index));

    taskList.appendChild(listItem);
  });

  updateCategories();
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'Cao':
      return 'text-red-500 dark:text-red-400';
    case 'Trung bình':
      return 'text-yellow-500 dark:text-yellow-400';
    case 'Thấp':
      return 'text-green-500 dark:text-green-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
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

function updateCategories() {
  categories = new Set(tasks.map(task => task.category));
  filterCategory.innerHTML = '<option value="all">Tất cả danh mục</option>';
  categories.forEach(category => {
    if (category) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      filterCategory.appendChild(option);
    }
  });
}

addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskInput = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const categoryInput = document.getElementById('categoryInput');

  if (taskInput.value.trim() !== '') {
    const newTask = {
      text: taskInput.value.trim(),
      completed: false,
      priority: prioritySelect.value,
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      category: categoryInput.value.trim()
    };

    addTask(newTask);
    taskInput.value = '';
    prioritySelect.value = 'Thấp';
    startDateInput.value = '';
    endDateInput.value = '';
    categoryInput.value = '';
  }
});

searchInput.addEventListener('input', renderTasks);
filterPriority.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);
filterCategory.addEventListener('change', renderTasks);

// Initial render
renderTasks();
updateDarkModeStyles();