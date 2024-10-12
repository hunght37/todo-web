const taskList = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const searchInput = document.getElementById('searchInput');
const filterPriority = document.getElementById('filterPriority');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const darkModeToggle = document.getElementById('darkModeToggle');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let darkMode = localStorage.getItem('darkMode') === 'enabled';
let categories = new Set();

// Dark mode functions
function enableDarkMode() {
  document.documentElement.classList.add('dark');
  localStorage.setItem('darkMode', 'enabled');
  darkMode = true;
}

function disableDarkMode() {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('darkMode', null);
  darkMode = false;
}

// Check user preference and set initial mode
if (darkMode) {
  enableDarkMode();
}

darkModeToggle.addEventListener('click', () => {
  darkMode ? disableDarkMode() : enableDarkMode();
});

addTaskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const taskInput = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('prioritySelect');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const categoryInput = document.getElementById('categoryInput');

  const task = {
    id: Date.now(),
    text: taskInput.value,
    priority: prioritySelect.value,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    category: categoryInput.value,
    completed: false,
  };

  tasks.unshift(task);
  if (task.category) {
    categories.add(task.category);
    updateCategoryFilter();
  }
  saveTasks();
  renderTasks();
  addTaskForm.reset();
});

function renderTasks() {
  const searchTerm = searchInput.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  const statusFilter = filterStatus.value;
  const categoryFilter = filterCategory.value;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' && task.completed) || 
      (statusFilter === 'incomplete' && !task.completed);
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  taskList.innerHTML = '';
  filteredTasks.forEach(task => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
    task.completed ? 'bg-green-50 dark:bg-green-900' : ''
  }`;
  li.innerHTML = `
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center space-x-2 flex-grow">
        <input type="checkbox" class="form-checkbox h-5 w-5 text-blue-600" ${task.completed ? 'checked' : ''}>
        <span class="flex-grow ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}">${
    task.text
  }</span>
      </div>
      <div class="flex items-center space-x-2 flex-wrap">
        <span class="px-2 py-1 text-xs rounded-full ${getPriorityColor(
          task.priority
        )}">${task.priority}</span>
        ${task.category ? `<span class="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">${task.category}</span>` : ''}
        <span class="text-xs text-gray-500 dark:text-gray-400">${formatDate(task.startDate)} - ${formatDate(
    task.endDate
  )}</span>
        <button class="ml-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200" onclick="editTask(${task.id})">Sửa</button>
        <button class="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200" onclick="deleteTask(${task.id})">Xóa</button>
      </div>
    </div>
  `;

  li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
    task.completed = e.target.checked;
    saveTasks();
    renderTasks();
  });

  return li;
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'Cao':
      return 'bg-red-500 text-white';
    case 'Trung bình':
      return 'bg-yellow-400 text-gray-800 dark:text-gray-900';
    default:
      return 'bg-gray-400 text-white dark:bg-gray-600';
  }
}

function formatDate(dateString) {
  if (dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } else {
    return '';
  }
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasks();
  updateCategories();
  renderTasks();
}

function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('taskInput').value = task.text;
  document.getElementById('prioritySelect').value = task.priority;
  document.getElementById('startDate').value = task.startDate;
  document.getElementById('endDate').value = task.endDate;
  document.getElementById('categoryInput').value = task.category;

  // Remove the old task
  tasks = tasks.filter(t => t.id !== taskId);

  // Scroll to the form
  addTaskForm.scrollIntoView({ behavior: 'smooth' });
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateCategories() {
  categories = new Set(tasks.map(task => task.category).filter(Boolean));
  updateCategoryFilter();
}

function updateCategoryFilter() {
  const currentFilter = filterCategory.value;
  filterCategory.innerHTML = '<option value="all">Tất cả danh mục</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    filterCategory.appendChild(option);
  });
  filterCategory.value = currentFilter;
}

searchInput.addEventListener('input', renderTasks);
filterPriority.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);
filterCategory.addEventListener('change', renderTasks);

// Initial setup
updateCategories();
renderTasks();