export class TaskFilters {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        onFilter: options.onFilter || (() => {}),
        categories: options.categories || []
      };
      this.render();
    }
  
    render() {
      this.container.innerHTML = `
        <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4" role="search">
          <div class="form-group">
            <label for="searchInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Tasks
            </label>
            <input 
              type="text" 
              id="searchInput" 
              placeholder="Search..." 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
          </div>
  
          <div class="form-group">
            <label for="filterPriority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority Filter
            </label>
            <select 
              id="filterPriority" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All priorities</option>
              <option value="Cao">High</option>
              <option value="Trung bình">Medium</option>
              <option value="Thấp">Low</option>
            </select>
          </div>
  
          <div class="form-group">
            <label for="filterStatus" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status Filter
            </label>
            <select 
              id="filterStatus" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
  
          <div class="form-group">
            <label for="filterCategory" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Filter
            </label>
            <select 
              id="filterCategory" 
              class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All categories</option>
              ${this.options.categories.map(category => `
                <option value="${category}">${category}</option>
              `).join('')}
            </select>
          </div>
        </div>
      `;
  
      this.attachEventListeners();
    }
  
    attachEventListeners() {
      const inputs = [
        'searchInput',
        'filterPriority',
        'filterStatus',
        'filterCategory'
      ];
  
      inputs.forEach(id => {
        this.container.querySelector(`#${id}`).addEventListener('input', () => {
          this.emitFilters();
        });
      });
    }
  
    emitFilters() {
      const filters = {
        search: this.container.querySelector('#searchInput').value,
        priority: this.container.querySelector('#filterPriority').value,
        status: this.container.querySelector('#filterStatus').value,
        category: this.container.querySelector('#filterCategory').value
      };
  
      this.options.onFilter(filters);
    }
  
    updateCategories(categories) {
      this.options.categories = categories;
      const select = this.container.querySelector('#filterCategory');
      select.innerHTML = `
        <option value="all">All categories</option>
        ${categories.map(category => `
          <option value="${category}">${category}</option>
        `).join('')}
      `;
    }
  }