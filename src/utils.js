// import { extraCosts, materials, staff } from "../db/data";

function populateSelects() {
    const staffSelect = document.getElementById("task-assigned-staff");
    const materialSelects = document.querySelectorAll(".material-select");
    const expenseSelects = document.querySelectorAll(".expense-select");

    if (staffSelect) {
        staffSelect.innerHTML =
            '<option value="">Seleccionar personal</option>' +
            staff
                .map(
                    (s, index) => `<option value="${index}">${s.name}</option>`,
                )
                .join("");
    }

    materialSelects.forEach((select) => {
        select.innerHTML =
            '<option value="">Seleccionar material</option>' +
            materials
                .map((m) => `<option value="${m.name}">${m.name}</option>`)
                .join("");
    });

    expenseSelects.forEach((select) => {
        select.innerHTML =
            '<option value="">Seleccionar gasto</option>' +
            extraCosts
                .map((e) => `<option value="${e.name}">${e.name}</option>`)
                .join("");
    });
}
