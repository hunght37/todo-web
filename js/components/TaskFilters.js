export class TaskList {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        itemsPerPage: options.itemsPerPage || 10,
        onStatusChange: options.onStatusChange || (() => {}),
        onEdit: options.onEdit || (() => {}),
        onDelete: options.onDelete || (() => {})
      };
      this.currentPage = 1;
    }
  
    render(tasks, filters = {}) {
      const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
      const endIndex = startIndex + this.options.itemsPerPage;
      const filteredTasks = this.filterTasks(tasks, filters);
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
  
      this.container.innerHTML = `
        <ul class="space-y-4" role="list" aria-label="Todo list">
          ${paginatedTasks.map((task, index) => this.renderTask(task, startIndex + index)).join('')}
        </ul>
        ${this.renderPagination(filteredTasks.length)}
      `;
  
      this.attachEventListeners(paginatedTasks);
    }
  
    filterTasks(tasks, filters) {
      return tasks.filter(task => {
        const matchesSearch = !filters.search || 
          task.text.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPriority = !filters.priority || 
          filters.priority === 'all' || 
          task.priority === filters.priority;
        const matchesStatus = !filters.status || 
          filters.status === 'all' || 
          (filters.status === 'completed' && task.completed) || 
          (filters.status === 'incomplete' && !task.completed);
        const matchesCategory = !filters.category || 
          filters.category === 'all' || 
          task.category === filters.category;
  
        return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
      });
    }
  
    renderTask(task, index) {
      return `
        <li class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 ${
          task.completed ? 'opacity-50' : ''
        }" data-task-index="${index}">
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              ${task.completed ? 'checked' : ''} 
              class="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400"
              aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
            >
            <span class="text-lg font-semibold ${task.completed ? 'line-through' : ''}">${
              DOMPurify.sanitize(task.text)
            }</span>
          </div>
          <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <span class="text-sm ${this.getPriorityColor(task.priority)}">${task.priority}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ${task.startDate} - ${task.endDate}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400">${task.category}</span>
            <button class="edit-btn text-blue-500 hover:text-blue-700" aria-label="Edit task">
              Edit
            </button>
            <button class="delete-btn text-red-500 hover:text-red-700" aria-label="Delete task">
              Delete
            </button>
          </div>
        </li>
      `;
    }
  
    renderPagination(totalItems) {
      const totalPages = Math.ceil(totalItems / this.options.itemsPerPage);
      if (totalPages <= 1) return '';
  
      return `
        <div class="flex justify-center space-x-2 mt-4" role="navigation" aria-label="Pagination">
          ${Array.from({ length: totalPages }, (_, i) => i + 1)
            .map(page => `
              <button 
                class="px-3 py-1 rounded ${
                  page === this.currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }"
                ${page === this.currentPage ? 'aria-current="page"' : ''}
                data-page="${page}"
              >
                ${page}
              </button>
            `).join('')}
        </div>
      `;
    }
  
    getPriorityColor(priority) {
      const colors = {
        'Cao': 'text-red-500 dark:text-red-400',
        'Trung bình': 'text-yellow-500 dark:text-yellow-400',
        'Thấp': 'text-green-500 dark:text-green-400'
      };
      return colors[priority] || 'text-gray-500 dark:text-gray-400';
    }
  
    attachEventListeners(tasks) {
      this.container.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.addEventListener('change', () => {
          this.options.onStatusChange(tasks[index], index);
        });
      });
  
      this.container.querySelectorAll('.edit-btn').forEach((button, index) => {
        button.addEventListener('click', () => {
          this.options.onEdit(tasks[index], index);
        });
      });
  
      this.container.querySelectorAll('.delete-btn').forEach((button, index) => {
        button.addEventListener('click', () => {
          this.options.onDelete(tasks[index], index);
        });
      });
  
      this.container.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', () => {
          this.currentPage = parseInt(button.dataset.page);
          this.render(tasks);
        });
      });
    }
  }