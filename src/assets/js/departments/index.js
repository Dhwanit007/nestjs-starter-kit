
$(document).ready(function () {
    $('#departmentsTable').DataTable({
        processing: true,
        serverSide: false,
        ajax: {
            url: "/departments/all",
            type: "GET",
            dataSrc: function (json) {
                // extract the array from payload.data
                return json.payload ? Object.values(json.payload) : [];
            }
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { data: "name" },
            {
                data: "createdAt",
                render: function (date) {
                    return new Date(date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    });
                }
            },
            {
                data: "id",
                render: function (id) {
                    return `
                    <button class="btn btn-sm btn-primary editDeptBtn" 
                data-id="${id}" 
                data-bs-toggle="modal" 
                data-bs-target="#editDepartmentModal">
                Edit
            </button>

                    <button class="btn btn-sm btn-danger" 
                data-bs-toggle="modal" 
                data-bs-target="#deleteDepartmentModal"
                data-dept-id="${id}">
                Delete
            </button>
                `;
                }
            }
        ]
    });

})

// Delete modal 
const deleteDeptForm = document.getElementById('delete-department-form');
const deleteDeptModal = document.getElementById('deleteDepartmentModal');

deleteDeptModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const deptId = button.getAttribute('data-dept-id');

    document.getElementById('deleteDeptId').value = deptId;

    deleteDeptForm.action = `/departments/delete/${deptId}`;
});

// Edit Modal 
const editDeptForm = document.getElementById('editDepartmentForm');
const editDeptModal = document.getElementById('editDepartmentModal');

editDeptModal.addEventListener('show.bs.modal', async function (event) {

    const button = event.relatedTarget;
    const deptId = button.getAttribute('data-id');

    // console.log("DEPT ID =", deptId);

    // Set hidden ID
    document.getElementById('editDeptId').value = deptId;

    // Set dynamic form action
    editDeptForm.action = `/departments/update/${deptId}`;

    // Fetch department details
    const res = await fetch(`/departments/api/${deptId}`);
    const data = await res.json();

    // console.log("DEPT DATA =", data);

    const dept = data.payload;

    // Fill inputs
    document.getElementById('editDeptName').value = dept.name || '';
    document.getElementById('editDeptDescription').value = dept.description || '';

    // Load employees list
    const empRes = await fetch('/employee/all');
    const empJson = await empRes.json();

    const employees = empJson.data;

    const select = document.getElementById('editAssignedEmployees');
    select.innerHTML = '';

    const assignedIds = (dept.assignedEmployees || []).map(e => e.id);

    employees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id; // make sure emp.id exists
        opt.textContent = `${emp.name} (${emp.email})`;

        if (assignedIds.includes(emp.id)) {
            opt.selected = true;
        }

        select.appendChild(opt);
    });

    $(select).trigger("change");
});
