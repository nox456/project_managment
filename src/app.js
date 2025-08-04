import { tasks, materials, staff, extraCosts } from '../db/data.js';

class ProjectManagement {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFormHandlers();
        this.loadInitialData();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetButton = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (targetSection && targetButton) {
            targetSection.classList.add('active');
            targetButton.classList.add('active');
            this.currentSection = sectionName;
            this.updatePageTitle(sectionName);
            this.initializeSectionData(sectionName);
        }
    }

    updatePageTitle(sectionName) {
        const titles = {
            dashboard: 'Dashboard del Proyecto',
            tasks: 'Gestión de Tareas',
            staff: 'Gestión de Personal',
            materials: 'Gestión de Materiales',
            expenses: 'Gestión de Otros Gastos'
        };

        const pageTitle = document.getElementById('page-title');
        const title = titles[sectionName] || 'Gestión de Proyecto';
        
        if (pageTitle) {
            pageTitle.textContent = title;
        }
        document.title = title;
    }

    initializeSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'staff':
                this.loadStaff();
                break;
            case 'materials':
                this.loadMaterials();
                break;
            case 'expenses':
                this.loadExpenses();
                break;
        }
    }

    setupFormHandlers() {
        // Task form
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', this.handleTaskSubmit.bind(this));
        }

        // Staff form
        const staffForm = document.getElementById('staff-form');
        if (staffForm) {
            staffForm.addEventListener('submit', this.handleStaffSubmit.bind(this));
        }

        // Material form
        const materialForm = document.getElementById('material-form');
        if (materialForm) {
            materialForm.addEventListener('submit', this.handleMaterialSubmit.bind(this));
        }

        // Expense form
        const expenseForm = document.getElementById('expense-form');
        if (expenseForm) {
            expenseForm.addEventListener('submit', this.handleExpenseSubmit.bind(this));
        }

        // Dynamic buttons
        document.addEventListener('click', this.handleDynamicButtons.bind(this));

        // Task filter
        const taskFilter = document.getElementById('task-filter');
        if (taskFilter) {
            taskFilter.addEventListener('change', () => this.loadTasks());
        }

        // Add material/expense buttons
        const addMaterialBtn = document.getElementById('add-material');
        if (addMaterialBtn) {
            addMaterialBtn.addEventListener('click', this.addMaterialRow.bind(this));
        }

        const addExpenseBtn = document.getElementById('add-expense');
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', this.addExpenseRow.bind(this));
        }
    }

    handleDynamicButtons(e) {
        if (e.target.classList.contains('remove-material')) {
            e.target.closest('.material-item').remove();
        }
        if (e.target.classList.contains('remove-expense')) {
            e.target.closest('.expense-item').remove();
        }
        if (e.target.classList.contains('toggle-task')) {
            const index = parseInt(e.target.getAttribute('data-task-index'));
            this.toggleTask(index);
        }
        if (e.target.classList.contains('delete-staff')) {
            const index = parseInt(e.target.getAttribute('data-staff-index'));
            staff.splice(index, 1);
            this.loadStaff();
        }
        if (e.target.classList.contains('delete-material')) {
            const index = parseInt(e.target.getAttribute('data-material-index'));
            materials.splice(index, 1);
            this.loadMaterials();
        }
        if (e.target.classList.contains('delete-expense')) {
            const index = parseInt(e.target.getAttribute('data-expense-index'));
            extraCosts.splice(index, 1);
            this.loadExpenses();
        }
    }

    loadInitialData() {
        this.loadDashboard();
        this.populateSelects();
    }

    populateSelects() {
        const staffSelect = document.getElementById('task-assigned-staff');
        const materialSelects = document.querySelectorAll('.material-select');
        const expenseSelects = document.querySelectorAll('.expense-select');

        if (staffSelect) {
            staffSelect.innerHTML = '<option value="">Seleccionar personal</option>' + 
                staff.map((s, index) => `<option value="${index}">${s.name}</option>`).join('');
        }

        materialSelects.forEach(select => {
            select.innerHTML = '<option value="">Seleccionar material</option>' + 
                materials.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
        });

        expenseSelects.forEach(select => {
            select.innerHTML = '<option value="">Seleccionar gasto</option>' + 
                extraCosts.map(e => `<option value="${e.name}">${e.name}</option>`).join('');
        });
    }

    // Dashboard methods
    loadDashboard() {
        this.updateTaskStats();
        this.updateCostBreakdown();
        this.updatePendingTasks();
    }

    updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalHours = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const totalTasksEl = document.getElementById('total-tasks');
        const completedTasksEl = document.getElementById('completed-tasks');
        const projectDurationEl = document.getElementById('project-duration');
        const progressTextEl = document.getElementById('progress-text');
        const progressBarEl = document.getElementById('project-progress');

        if (totalTasksEl) totalTasksEl.textContent = totalTasks;
        if (completedTasksEl) completedTasksEl.textContent = completedTasks;
        if (projectDurationEl) projectDurationEl.textContent = totalHours;
        if (progressTextEl) progressTextEl.textContent = `${progress}%`;
        if (progressBarEl) progressBarEl.style.width = `${progress}%`;
    }

    updateCostBreakdown() {
        const staffCosts = this.calculateStaffCosts();
        const materialsCosts = this.calculateMaterialsCosts();
        const expensesCosts = this.calculateExpensesCosts();
        const totalBudget = staffCosts + materialsCosts + expensesCosts;

        const budgetTotalEl = document.getElementById('budget-total');
        const actualTotalEl = document.getElementById('actual-total');
        const staffCostEl = document.getElementById('staff-cost');
        const staffActualEl = document.getElementById('staff-actual');
        const materialsCostEl = document.getElementById('materials-cost');
        const materialsActualEl = document.getElementById('materials-actual');
        const expensesCostEl = document.getElementById('expenses-cost');
        const expensesActualEl = document.getElementById('expenses-actual');

        if (budgetTotalEl) budgetTotalEl.textContent = totalBudget.toFixed(2);
        if (actualTotalEl) actualTotalEl.textContent = staffCosts.toFixed(2);
        if (staffCostEl) staffCostEl.textContent = staffCosts.toFixed(2);
        if (staffActualEl) staffActualEl.textContent = staffCosts.toFixed(2);
        if (materialsCostEl) materialsCostEl.textContent = materialsCosts.toFixed(2);
        if (materialsActualEl) materialsActualEl.textContent = materialsCosts.toFixed(2);
        if (expensesCostEl) expensesCostEl.textContent = expensesCosts.toFixed(2);
        if (expensesActualEl) expensesActualEl.textContent = expensesCosts.toFixed(2);
    }

    updatePendingTasks() {
        const pendingTasks = tasks.filter(task => !task.completed);
        const pendingTasksList = document.getElementById('pending-tasks-list');
        
        if (!pendingTasksList) return;

        if (pendingTasks.length === 0) {
            pendingTasksList.innerHTML = '<p>No hay tareas pendientes</p>';
            return;
        }

        pendingTasksList.innerHTML = pendingTasks.slice(0, 5).map(task => `
            <div class="pending-task-item">
                <h4>${task.name}</h4>
                <p>${task.hours || 0} horas</p>
            </div>
        `).join('');
    }

    calculateStaffCosts() {
        return tasks.reduce((total, task) => {
            if (task.staff && task.hours) {
                const staffHours = document.getElementById('task-staff-hours')?.value || task.hours;
                return total + (task.staff.costPerHour * parseFloat(staffHours));
            }
            return total;
        }, 0);
    }

    calculateMaterialsCosts() {
        return tasks.reduce((total, task) => {
            if (task.materials && Array.isArray(task.materials)) {
                const taskMaterialsCost = task.materials.reduce((materialsTotal, taskMaterial) => {
                    const material = materials.find(m => m.name === taskMaterial.name);
                    return materialsTotal + (material ? material.cost * taskMaterial.quantity : 0);
                }, 0);
                return total + taskMaterialsCost;
            }
            return total;
        }, 0);
    }

    calculateExpensesCosts() {
        return tasks.reduce((total, task) => {
            if (task.extraCosts && Array.isArray(task.extraCosts)) {
                const taskExpensesCost = task.extraCosts.reduce((expensesTotal, taskExpense) => {
                    const expense = extraCosts.find(e => e.name === taskExpense.name);
                    return expensesTotal + (expense ? expense.cost * taskExpense.quantity : 0);
                }, 0);
                return total + taskExpensesCost;
            }
            return total;
        }, 0);
    }

    // Task methods
    handleTaskSubmit(e) {
        e.preventDefault();
        
        const staffSelect = document.getElementById('task-assigned-staff');
        const selectedStaff = staffSelect.value !== '' ? staff[parseInt(staffSelect.value)] : null;
        
        console.log('Staff select value:', staffSelect.value);
        console.log('Selected staff:', selectedStaff);
        console.log('Available staff:', staff);
        
        const newTask = {
            name: document.getElementById('task-name').value,
            hours: parseInt(document.getElementById('task-duration').value),
            staff: selectedStaff,
            materials: this.getSelectedMaterials(),
            extraCosts: this.getSelectedExpenses(),
            completed: false
        };

        tasks.push(newTask);
        this.loadTasks();
        this.populateSelects();
        e.target.reset();
    }

    getSelectedMaterials() {
        const materialItems = document.querySelectorAll('.material-item');
        const selectedMaterials = [];
        
        materialItems.forEach(item => {
            const select = item.querySelector('.material-select');
            const quantity = item.querySelector('.material-quantity');
            if (select.value && quantity.value) {
                selectedMaterials.push({
                    name: select.value,
                    quantity: parseInt(quantity.value)
                });
            }
        });
        
        return selectedMaterials;
    }

    getSelectedExpenses() {
        const expenseItems = document.querySelectorAll('.expense-item');
        const selectedExpenses = [];
        
        expenseItems.forEach(item => {
            const select = item.querySelector('.expense-select');
            const quantity = item.querySelector('.expense-quantity');
            if (select.value && quantity.value) {
                selectedExpenses.push({
                    name: select.value,
                    quantity: parseInt(quantity.value)
                });
            }
        });
        
        return selectedExpenses;
    }

    addMaterialRow() {
        const container = document.getElementById('task-materials-container');
        const newRow = document.createElement('div');
        newRow.className = 'material-item';
        newRow.innerHTML = `
            <select class="material-select">
                <option value="">Seleccionar material</option>
                ${materials.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
            </select>
            <input type="number" class="material-quantity" min="1" placeholder="Cantidad">
            <button type="button" class="remove-material">×</button>
        `;
        container.appendChild(newRow);
    }

    addExpenseRow() {
        const container = document.getElementById('task-expenses-container');
        const newRow = document.createElement('div');
        newRow.className = 'expense-item';
        newRow.innerHTML = `
            <select class="expense-select">
                <option value="">Seleccionar gasto</option>
                ${extraCosts.map(e => `<option value="${e.name}">${e.name}</option>`).join('')}
            </select>
            <input type="number" class="expense-quantity" min="1" placeholder="Cantidad">
            <button type="button" class="remove-expense">×</button>
        `;
        container.appendChild(newRow);
    }

    loadTasks() {
        const tasksList = document.getElementById('tasks-list');
        const filter = document.getElementById('task-filter')?.value || 'all';
        
        if (!tasksList) return;

        let filteredTasks = tasks;
        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '<p>No hay tareas para mostrar.</p>';
            return;
        }

        tasksList.innerHTML = filteredTasks.map((task) => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <h3>${task.name}</h3>
                <p><strong>Horas:</strong> ${task.hours}</p>
                ${task.description ? `<p><strong>Descripción:</strong> ${task.description}</p>` : ''}
                ${task.startDate ? `<p><strong>Fecha de inicio:</strong> ${task.startDate}</p>` : ''}
                ${task.staff ? `<p><strong>Personal:</strong> ${task.staff.name} ($${task.staff.costPerHour}/h)</p>` : ''}
                ${task.materials && task.materials.length ? `<p><strong>Materiales:</strong> ${task.materials.map(m => `${m.name} (${m.quantity})`).join(', ')}</p>` : ''}
                ${task.extraCosts && task.extraCosts.length ? `<p><strong>Gastos:</strong> ${task.extraCosts.map(e => `${e.name} (${e.quantity})`).join(', ')}</p>` : ''}
                <button data-task-index="${tasks.indexOf(task)}" class="toggle-task">
                    ${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                </button>
            </div>
        `).join('');
    }

    toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        this.loadTasks();
        if (this.currentSection === 'dashboard') {
            this.loadDashboard();
        }
    }

    // Staff methods
    handleStaffSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('staff-name').value;
        const nationalId = document.getElementById('staff-national-id').value;
        const costPerHour = parseFloat(document.getElementById('staff-cost-per-hour').value);
        
        // Check for duplicate national ID
        if (staff.some(person => person.nationalId === nationalId)) {
            alert('Ya existe una persona con esta cédula de identidad.');
            return;
        }
        
        const newStaff = {
            name: name,
            nationalId: nationalId,
            costPerHour: costPerHour
        };

        staff.push(newStaff);
        this.loadStaff();
        this.populateSelects();
        e.target.reset();
        
        console.log('Personal agregado:', newStaff);
        console.log('Lista de personal actual:', staff);
    }

    loadStaff() {
        const staffList = document.getElementById('staff-list');
        
        if (!staffList) return;

        if (staff.length === 0) {
            staffList.innerHTML = '<p>No hay personal registrado.</p>';
            return;
        }

        staffList.innerHTML = staff.map((person, index) => `
            <div class="staff-item">
                <h3>${person.name}</h3>
                <p><strong>Cédula:</strong> ${person.nationalId}</p>
                <p><strong>Costo por hora:</strong> $${person.costPerHour}</p>
                <button data-staff-index="${index}" class="delete-staff">Eliminar</button>
            </div>
        `).join('');
    }

    // Material methods
    handleMaterialSubmit(e) {
        e.preventDefault();
        
        const newMaterial = {
            name: document.getElementById('material-name').value,
            description: document.getElementById('material-description').value,
            unit: document.getElementById('material-unit').value,
            cost: parseFloat(document.getElementById('material-cost').value)
        };

        materials.push(newMaterial);
        this.loadMaterials();
        this.populateSelects();
        e.target.reset();
    }

    loadMaterials() {
        const materialList = document.getElementById('material-list');
        
        if (!materialList) return;

        if (materials.length === 0) {
            materialList.innerHTML = '<p>No hay materiales registrados.</p>';
            return;
        }

        materialList.innerHTML = materials.map((material, index) => `
            <div class="material-item">
                <h3>${material.name}</h3>
                <p><strong>Unidad:</strong> ${material.unit}</p>
                <p><strong>Costo:</strong> $${material.cost}</p>
                ${material.description ? `<p><strong>Descripción:</strong> ${material.description}</p>` : ''}
                <button data-material-index="${index}" class="delete-material">Eliminar</button>
            </div>
        `).join('');
    }

    // Expense methods
    handleExpenseSubmit(e) {
        e.preventDefault();
        
        const newExpense = {
            name: document.getElementById('expense-name').value,
            description: document.getElementById('expense-description').value,
            unit: document.getElementById('expense-unit').value,
            cost: parseFloat(document.getElementById('expense-cost').value)
        };

        extraCosts.push(newExpense);
        this.loadExpenses();
        this.populateSelects();
        e.target.reset();
    }

    loadExpenses() {
        const expenseList = document.getElementById('expense-list');
        
        if (!expenseList) return;

        if (extraCosts.length === 0) {
            expenseList.innerHTML = '<p>No hay gastos registrados.</p>';
            return;
        }

        expenseList.innerHTML = extraCosts.map((expense, index) => `
            <div class="expense-item">
                <h3>${expense.name}</h3>
                <p><strong>Unidad:</strong> ${expense.unit}</p>
                <p><strong>Costo:</strong> $${expense.cost}</p>
                ${expense.description ? `<p><strong>Descripción:</strong> ${expense.description}</p>` : ''}
                <button data-expense-index="${index}" class="delete-expense">Eliminar</button>
            </div>
        `).join('');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectManagement();
});