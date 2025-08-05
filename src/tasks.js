import { staff, tasks, materials, extraCosts } from "../db/data.js";
import { populateSelects } from "./utils.js";

export function loadTasks() {
    const tasksList = document.getElementById("tasks-list");
    const filter = document.getElementById("task-filter")?.value || "all";

    if (!tasksList) return;

    let filteredTasks = tasks;
    if (filter === "completed") {
        filteredTasks = tasks.filter((task) => task.completed);
    } else if (filter === "pending") {
        filteredTasks = tasks.filter((task) => !task.completed);
    }

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = "<p>No hay tareas para mostrar.</p>";
        return;
    }

    tasksList.innerHTML = filteredTasks
        .map(
            (task) => {
                // Calculate material costs
                const materialsCost = task.materials && task.materials.length ? 
                    task.materials.reduce((total, taskMaterial) => {
                        const material = materials.find(m => m.name === taskMaterial.name);
                        return total + (material ? material.cost * taskMaterial.quantity : 0);
                    }, 0) : 0;

                // Calculate extra costs  
                const extraCostTotal = task.extraCosts && task.extraCosts.length ?
                    task.extraCosts.reduce((total, taskExpense) => {
                        const expense = extraCosts.find(e => e.name === taskExpense.name);
                        return total + (expense ? expense.cost * taskExpense.quantity : 0);
                    }, 0) : 0;

                // Calculate labor cost
                const laborCost = task.staff && task.hours ? task.staff.costPerHour * task.hours : 0;

                // Calculate total actual cost
                const totalActualCost = laborCost + materialsCost + extraCostTotal;

                return `
                <div class="task-item ${task.completed ? "completed" : ""}">
                    <h3>${task.name}</h3>
                    <div class="task-status">
                        <span class="status-badge ${task.completed ? 'completed' : 'pending'}">
                            ${task.completed ? 'Completada' : 'Pendiente'}
                        </span>
                    </div>
                    <p><strong>Duración:</strong> ${task.hours} horas</p>
                    ${task.description ? `<p><strong>Descripción:</strong> ${task.description}</p>` : ""}
                    ${task.startDate ? `<p><strong>Fecha de inicio:</strong> ${task.startDate}</p>` : ""}
                    ${task.staff ? `<p><strong>Personal asignado:</strong> ${task.staff.name} ($${task.staff.costPerHour}/h)</p>` : ""}
                    
                    <div class="cost-details">
                        <h4>Desglose de costos:</h4>
                        ${task.estimatedCost ? `<p><strong>Costo estimado:</strong> $${parseFloat(task.estimatedCost).toFixed(2)}</p>` : ""}
                        <p><strong>Costo real:</strong> $${totalActualCost.toFixed(2)}</p>
                        ${laborCost > 0 ? `<p>&nbsp;&nbsp;• Mano de obra: $${laborCost.toFixed(2)}</p>` : ""}
                        ${materialsCost > 0 ? `<p>&nbsp;&nbsp;• Materiales: $${materialsCost.toFixed(2)}</p>` : ""}
                        ${extraCostTotal > 0 ? `<p>&nbsp;&nbsp;• Otros gastos: $${extraCostTotal.toFixed(2)}</p>` : ""}
                    </div>

                    ${task.materials && task.materials.length ? `
                        <div class="materials-detail">
                            <h4>Materiales necesarios:</h4>
                            <ul>
                                ${task.materials.map(m => {
                                    const material = materials.find(mat => mat.name === m.name);
                                    return `<li>${m.name} - Cantidad: ${m.quantity}${material ? ` ($${material.cost}/unidad)` : ''}</li>`;
                                }).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    ${task.extraCosts && task.extraCosts.length ? `
                        <div class="expenses-detail">
                            <h4>Otros gastos:</h4>
                            <ul>
                                ${task.extraCosts.map(e => {
                                    const expense = extraCosts.find(exp => exp.name === e.name);
                                    return `<li>${e.name} - Cantidad: ${e.quantity}${expense ? ` ($${expense.cost}/unidad)` : ''}</li>`;
                                }).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    <button data-task-index="${tasks.indexOf(task)}" class="toggle-task">
                        ${task.completed ? "Marcar como pendiente" : "Marcar como completada"}
                    </button>
                </div>
                `;
            }
        )
        .join("");
}

export function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    loadTasks();
}
export function updateTaskStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalTasksEl = document.getElementById("total-tasks");
    const completedTasksEl = document.getElementById("completed-tasks");
    const progressTextEl = document.getElementById("progress-text");
    const progressBarEl = document.getElementById("project-progress");

    if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
    if (progressTextEl) progressTextEl.textContent = `${progress}%`;
    if (progressBarEl) progressBarEl.style.width = `${progress}%`;
}

export function updatePendingTasks() {
    const pendingTasks = tasks.filter((task) => !task.completed);
    const pendingTasksList = document.getElementById("pending-tasks-list");

    if (!pendingTasksList) return;

    if (pendingTasks.length === 0) {
        pendingTasksList.innerHTML = "<p>No hay tareas pendientes</p>";
        return;
    }

    pendingTasksList.innerHTML = pendingTasks
        .slice(0, 5)
        .map(
            (task) => {
                // Calculate estimated costs for pending tasks
                const materialsCost = task.materials && task.materials.length ? 
                    task.materials.reduce((total, taskMaterial) => {
                        const material = materials.find(m => m.name === taskMaterial.name);
                        return total + (material ? material.cost * taskMaterial.quantity : 0);
                    }, 0) : 0;

                const extraCostTotal = task.extraCosts && task.extraCosts.length ?
                    task.extraCosts.reduce((total, taskExpense) => {
                        const expense = extraCosts.find(e => e.name === taskExpense.name);
                        return total + (expense ? expense.cost * taskExpense.quantity : 0);
                    }, 0) : 0;

                const laborCost = task.staff && task.hours ? task.staff.costPerHour * task.hours : 0;
                const totalEstimatedCost = laborCost + materialsCost + extraCostTotal;

                return `
                <div class="pending-task-item">
                    <h4>${task.name}</h4>
                    <p><strong>Duración:</strong> ${task.hours || 0} horas</p>
                    ${task.staff ? `<p><strong>Asignado a:</strong> ${task.staff.name}</p>` : '<p><strong>Sin asignar</strong></p>'}
                    ${task.estimatedCost ? `<p><strong>Presupuesto:</strong> $${parseFloat(task.estimatedCost).toFixed(2)}</p>` : ''}
                    <p><strong>Costo estimado:</strong> $${totalEstimatedCost.toFixed(2)}</p>
                    ${task.materials && task.materials.length ? `
                        <p><strong>Materiales:</strong> ${task.materials.map(m => `${m.name} (${m.quantity})`).join(", ")}</p>
                    ` : ""}
                    ${task.extraCosts && task.extraCosts.length ? `
                        <p><strong>Otros gastos:</strong> ${task.extraCosts.map(e => `${e.name} (${e.quantity})`).join(", ")}</p>
                    ` : ""}
                </div>
                `;
            }
        )
        .join("");
}

export function handleTaskSubmit(e) {
    e.preventDefault();

    const staffSelect = document.getElementById("task-assigned-staff");
    const selectedStaff =
        staffSelect.value !== "" ? staff[parseInt(staffSelect.value)] : null;

    // Validation: require staff selection
    if (!selectedStaff) {
        alert("Debes asignar personal para crear una nueva tarea.");
        staffSelect.focus();
        return;
    }

    const newTask = {
        name: document.getElementById("task-name").value,
        hours: parseInt(document.getElementById("task-duration").value),
        staff: selectedStaff,
        materials: this.getSelectedMaterials(),
        extraCosts: this.getSelectedExpenses(),
        estimatedCost: document.getElementById("task-estimated-cost").value,
        completed: false,
    };

    tasks.push(newTask);
    if (typeof window.ProjectManagementInstance === 'object' && window.ProjectManagementInstance.saveToStorage) {
        window.ProjectManagementInstance.saveToStorage();
    }
    loadTasks();
    populateSelects();
    e.target.reset();
}
