export class TaskForm {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        onSubmit: options.onSubmit || (() => {}),
        categories: options.categories || []
      };
      this.render();
    }
  
    render() {
      this.container.innerHTML = `
        <form class="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md" aria-label="Add new task">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="taskInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Description
              </label>
              <input 
                type="text" 
                id="taskInput" 
                name="taskInput" 
                placeholder="Add a new task..." 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                required
              >
            </div>
  
            <div class="form-group">
              <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select 
                id="priority" 
                name="priority" 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="Thấp">Low</option>
                <option value="Trung bình">Medium</option>
                <option value="Cao">High</option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate" 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
            </div>
  
            <div class="form-group">
              <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input 
                type="date" 
                id="endDate" 
                name="endDate" 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
            </div>
  
            <div class="form-group">
              <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                list="categories"
                placeholder="Enter or select category" 
                class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
              <datalist id="categories">
                ${this.options.categories.map(category => `
                  <option value="${category}">${category}</option>
                `).join('')}
              </datalist>
            </div>
  
            <div class="form-group flex items-end">
              <button 
                type="submit" 
                class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>
      `;
  
      this.attachEventListeners();
    }
  
    attachEventListeners() {
      this.container.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const task = {
          text: DOMPurify.sanitize(formData.get('taskInput')),
          priority: formData.get('priority'),
          startDate: formData.get('startDate'),
          endDate: formData.get('endDate'),
          category: DOMPurify.sanitize(formData.get('category')),
          completed: false
        };
  
        this.options.onSubmit(task);
        e.target.reset();
      });
    }
  
    updateCategories(categories) {
      this.options.categories = categories;
      const datalist = this.container.querySelector('#categories');
      datalist.innerHTML = categories.map(category => `
        <option value="${category}">${category}</option>
      `).join('');
    }
  }