import { tasks, materials, staff, extraCosts } from "../db/data.js";
import {
	handleTaskSubmit,
    loadTasks,
    toggleTask,
    updatePendingTasks,
    updateTaskStats,
} from "./tasks.js";
import { populateSelects } from "./utils.js";

class ProjectManagement {
    constructor() {
        this.currentSection = "dashboard";
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFormHandlers();
        this.loadInitialData();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll(".nav-btn");
        navButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const section = e.target.getAttribute("data-section");
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll(".page-section").forEach((section) => {
            section.classList.remove("active");
        });

        // Remove active class from nav buttons
        document.querySelectorAll(".nav-btn").forEach((btn) => {
            btn.classList.remove("active");
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        const targetButton = document.querySelector(
            `[data-section="${sectionName}"]`,
        );

        if (targetSection && targetButton) {
            targetSection.classList.add("active");
            targetButton.classList.add("active");
            this.currentSection = sectionName;
            this.updatePageTitle(sectionName);
            this.initializeSectionData(sectionName);
        }
    }

    updatePageTitle(sectionName) {
        const titles = {
            dashboard: "Dashboard del Proyecto",
            tasks: "Gestión de Tareas",
            staff: "Gestión de Personal",
            materials: "Gestión de Materiales",
            expenses: "Gestión de Otros Gastos",
        };

        const pageTitle = document.getElementById("page-title");
        const title = titles[sectionName] || "Gestión de Proyecto";

        if (pageTitle) {
            pageTitle.textContent = title;
        }
        document.title = title;
    }

    initializeSectionData(sectionName) {
        switch (sectionName) {
            case "dashboard":
                this.loadDashboard();
                break;
            case "tasks":
                loadTasks();
                break;
            case "staff":
                this.loadStaff();
                break;
            case "materials":
                this.loadMaterials();
                break;
            case "expenses":
                this.loadExpenses();
                break;
        }
    }

    setupFormHandlers() {
        // Task form
        const taskForm = document.getElementById("task-form");
        if (taskForm) {
            taskForm.addEventListener(
                "submit",
                handleTaskSubmit.bind(this),
            );
        }

        // Staff form
        const staffForm = document.getElementById("staff-form");
        if (staffForm) {
            staffForm.addEventListener(
                "submit",
                this.handleStaffSubmit.bind(this),
            );
        }

        // Material form
        const materialForm = document.getElementById("material-form");
        if (materialForm) {
            materialForm.addEventListener(
                "submit",
                this.handleMaterialSubmit.bind(this),
            );
        }

        // Expense form
        const expenseForm = document.getElementById("expense-form");
        if (expenseForm) {
            expenseForm.addEventListener(
                "submit",
                this.handleExpenseSubmit.bind(this),
            );
        }

        // Dynamic buttons
        document.addEventListener(
            "click",
            this.handleDynamicButtons.bind(this),
        );

        // Task filter
        const taskFilter = document.getElementById("task-filter");
        if (taskFilter) {
            taskFilter.addEventListener("change", () => loadTasks());
        }

        // Add material/expense buttons
        const addMaterialBtn = document.getElementById("add-material");
        if (addMaterialBtn) {
            addMaterialBtn.addEventListener(
                "click",
                this.addMaterialRow.bind(this),
            );
        }

        const addExpenseBtn = document.getElementById("add-expense");
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener(
                "click",
                this.addExpenseRow.bind(this),
            );
        }
    }

    handleDynamicButtons(e) {
        if (e.target.classList.contains("remove-material")) {
            e.target.closest(".material-item").remove();
        }
        if (e.target.classList.contains("remove-expense")) {
            e.target.closest(".expense-item").remove();
        }
        if (e.target.classList.contains("toggle-task")) {
            const index = parseInt(e.target.getAttribute("data-task-index"));
            toggleTask(index);
        }
        if (e.target.classList.contains("delete-staff")) {
            const index = parseInt(e.target.getAttribute("data-staff-index"));
            staff.splice(index, 1);
            this.loadStaff();
        }
        if (e.target.classList.contains("delete-material")) {
            const index = parseInt(
                e.target.getAttribute("data-material-index"),
            );
            materials.splice(index, 1);
            this.loadMaterials();
        }
        if (e.target.classList.contains("delete-expense")) {
            const index = parseInt(e.target.getAttribute("data-expense-index"));
            extraCosts.splice(index, 1);
            this.loadExpenses();
        }
    }

    loadInitialData() {
        this.loadDashboard();
        populateSelects();
    }

    // Dashboard methods
    loadDashboard() {
        updateTaskStats();
        this.updateCostBreakdown();
        updatePendingTasks();
    }

    updateCostBreakdown() {
        const staffCosts = this.calculateStaffCosts();
        const materialsCosts = this.calculateMaterialsCosts();
        const expensesCosts = this.calculateExpensesCosts();
        let totalBudget = 0;
        tasks.forEach((task) => {
            totalBudget += parseFloat(task.estimatedCost);
        });

        const budgetTotalEl = document.getElementById("budget-total");
        const actualTotalEl = document.getElementById("actual-total");
        const staffCostEl = document.getElementById("staff-cost");
        const staffActualEl = document.getElementById("staff-actual");
        const materialsCostEl = document.getElementById("materials-cost");
        const materialsActualEl = document.getElementById("materials-actual");
        const expensesCostEl = document.getElementById("expenses-cost");
        const expensesActualEl = document.getElementById("expenses-actual");

        if (budgetTotalEl) budgetTotalEl.textContent = totalBudget.toFixed(2);
        if (actualTotalEl)
            actualTotalEl.textContent = (
                staffCosts +
                materialsCosts +
                expensesCosts
            ).toFixed(2);
        if (staffCostEl) staffCostEl.textContent = staffCosts.toFixed(2);
        if (staffActualEl) staffActualEl.textContent = staffCosts.toFixed(2);
        if (materialsCostEl)
            materialsCostEl.textContent = materialsCosts.toFixed(2);
        if (materialsActualEl)
            materialsActualEl.textContent = materialsCosts.toFixed(2);
        if (expensesCostEl)
            expensesCostEl.textContent = expensesCosts.toFixed(2);
        if (expensesActualEl)
            expensesActualEl.textContent = expensesCosts.toFixed(2);
    }

    calculateStaffCosts() {
        return tasks.reduce((total, task) => {
            if (task.completed && task.staff && task.hours) {
                const staffHours =
                    document.getElementById("task-staff-hours")?.value ||
                    task.hours;
                return total + task.staff.costPerHour * parseFloat(staffHours);
            }
            return total;
        }, 0);
    }

    calculateMaterialsCosts() {
        return tasks.reduce((total, task) => {
            if (task.completed && task.materials && Array.isArray(task.materials)) {
                const taskMaterialsCost = task.materials.reduce(
                    (materialsTotal, taskMaterial) => {
                        const material = materials.find(
                            (m) => m.name === taskMaterial.name,
                        );
                        return (
                            materialsTotal +
                            (material
                                ? material.cost * taskMaterial.quantity
                                : 0)
                        );
                    },
                    0,
                );
                return total + taskMaterialsCost;
            }
            return total;
        }, 0);
    }

    calculateExpensesCosts() {
        return tasks.reduce((total, task) => {
            if (task.completed && task.extraCosts && Array.isArray(task.extraCosts)) {
                const taskExpensesCost = task.extraCosts.reduce(
                    (expensesTotal, taskExpense) => {
                        const expense = extraCosts.find(
                            (e) => e.name === taskExpense.name,
                        );
                        return (
                            expensesTotal +
                            (expense ? expense.cost * taskExpense.quantity : 0)
                        );
                    },
                    0,
                );
                return total + taskExpensesCost;
            }
            return total;
        }, 0);
    }

    getSelectedMaterials() {
        const materialItems = document.querySelectorAll(".material-item");
        const selectedMaterials = [];

        materialItems.forEach((item) => {
			console.log(item)
            const select = item.querySelector(".material-select");
            const quantity = item.querySelector(".material-quantity");
            const material = materials.find(
                (material) => material.name == select.value,
            );
            if (material) {
                selectedMaterials.push({
                    name: material.name,
                    cost: material.cost,
                    quantity: quantity.value,
                });
            }
        });

        return selectedMaterials;
    }

    getSelectedExpenses() {
        const expenseItems = document.querySelectorAll(".expense-item");
        const selectedExpenses = [];

        expenseItems.forEach((item) => {
            const select = item.querySelector(".expense-select");
            const quantity = item.querySelector(".expense-quantity");
            if (select.value && quantity.value) {
                selectedExpenses.push({
                    name: select.value,
                    quantity: parseInt(quantity.value),
                });
            }
        });

        return selectedExpenses;
    }

    addMaterialRow() {
        const container = document.getElementById("task-materials-container");
        const newRow = document.createElement("div");
        newRow.className = "material-item";
        newRow.innerHTML = `
            <select class="material-select">
                <option value="">Seleccionar material</option>
                ${materials.map((m) => `<option value="${m.name}">${m.name}</option>`).join("")}
            </select>
            <input type="number" class="material-quantity" min="1" placeholder="Cantidad">
            <button type="button" class="remove-material">×</button>
        `;
        container.appendChild(newRow);
    }

    addExpenseRow() {
        const container = document.getElementById("task-expenses-container");
        const newRow = document.createElement("div");
        newRow.className = "expense-item";
        newRow.innerHTML = `
            <select class="expense-select">
                <option value="">Seleccionar gasto</option>
                ${extraCosts.map((e) => `<option value="${e.name}">${e.name}</option>`).join("")}
            </select>
            <input type="number" class="expense-quantity" min="1" placeholder="Cantidad">
            <button type="button" class="remove-expense">×</button>
        `;
        container.appendChild(newRow);
    }

    // Staff methods
    handleStaffSubmit(e) {
        e.preventDefault();

        const name = document.getElementById("staff-name").value;
        const nationalId = document.getElementById("staff-national-id").value;
        const costPerHour = parseFloat(
            document.getElementById("staff-cost-per-hour").value,
        );

        // Check for duplicate national ID
        if (staff.some((person) => person.nationalId === nationalId)) {
            alert("Ya existe una persona con esta cédula de identidad.");
            return;
        }

        const newStaff = {
            name: name,
            nationalId: nationalId,
            costPerHour: costPerHour,
        };

        staff.push(newStaff);
        this.loadStaff();
        populateSelects();
        e.target.reset();
    }

    loadStaff() {
        const staffList = document.getElementById("staff-list");

        if (!staffList) return;

        if (staff.length === 0) {
            staffList.innerHTML = "<p>No hay personal registrado.</p>";
            return;
        }

        staffList.innerHTML = staff
            .map(
                (person, index) => `
            <div class="staff-item">
                <h3>${person.name}</h3>
                <p><strong>Cédula:</strong> ${person.nationalId}</p>
                <p><strong>Costo por hora:</strong> $${person.costPerHour}</p>
                <button data-staff-index="${index}" class="delete-staff">Eliminar</button>
            </div>
        `,
            )
            .join("");
    }

    // Material methods
    handleMaterialSubmit(e) {
        e.preventDefault();

        const newMaterial = {
            name: document.getElementById("material-name").value,
            cost: parseFloat(document.getElementById("material-cost").value),
        };

        materials.push(newMaterial);
        this.loadMaterials();
        populateSelects();
        e.target.reset();
    }

    loadMaterials() {
        const materialList = document.getElementById("material-list");

        if (!materialList) return;

        if (materials.length === 0) {
            materialList.innerHTML = "<p>No hay materiales registrados.</p>";
            return;
        }

        materialList.innerHTML = materials
            .map(
                (material) => `
            <div class="material">
                <h3>${material.name}</h3>
                <p><strong>Costo:</strong> $${material.cost}</p>
            </div>
        `,
            )
            .join("");
    }

    // Expense methods
    handleExpenseSubmit(e) {
        e.preventDefault();

        const newExpense = {
            name: document.getElementById("expense-name").value,
            description: document.getElementById("expense-description").value,
            unit: document.getElementById("expense-unit").value,
            cost: parseFloat(document.getElementById("expense-cost").value),
        };

        extraCosts.push(newExpense);
        this.loadExpenses();
        populateSelects();
        e.target.reset();
    }

    loadExpenses() {
        const expenseList = document.getElementById("expense-list");

        if (!expenseList) return;

        if (extraCosts.length === 0) {
            expenseList.innerHTML = "<p>No hay gastos registrados.</p>";
            return;
        }

        expenseList.innerHTML = extraCosts
            .map(
                (expense, index) => `
            <div class="expense-item">
                <h3>${expense.name}</h3>
                <p><strong>Unidad:</strong> ${expense.unit}</p>
                <p><strong>Costo:</strong> $${expense.cost}</p>
                ${expense.description ? `<p><strong>Descripción:</strong> ${expense.description}</p>` : ""}
                <button data-expense-index="${index}" class="delete-expense">Eliminar</button>
            </div>
        `,
            )
            .join("");
    }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new ProjectManagement();
});
