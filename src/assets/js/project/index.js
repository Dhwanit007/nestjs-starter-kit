let table;
let editModal;

$(document).ready(function () {
    table = $('#projectsTable').DataTable({
        processing: true,
        serverSide: false,
        ajax: {
            url: "/api/projects/getall",
            type: "GET",
            dataSrc: json => json.data // MUST match { data: projects }
        },
        columns: [
            { data: null, render: (data, type, row, meta) => meta.row + 1 },
            { data: "name" },
            {
                data: "assignedEmployees",
                render: employees => {
                    if (!employees || employees.length === 0) return "—";
                    return employees.map(e => `<span class='ri-account-circle-line'></span> ${e.name}<br>`).join("");
                }
            }, { data: 'status' },
            { data: "createdAt", render: date => new Date(date).toLocaleDateString() },
            {
                data: "id",
                render: id => `
                    <button class="btn btn-sm btn-warning editBtn" data-id="${id}">Edit</button>
                    <button 
        class="btn btn-sm btn-danger deleteBtn" 
        data-bs-toggle="modal" 
        data-bs-target="#deleteProjectModal" 
        data-id="${id}">
        Delete
    </button>
    `
            }
        ]
    });
});

// Initialize single Bootstrap Modal instance
editModal = new bootstrap.Modal(document.getElementById('editProjectModal'));

// Open Edit Modal
$('#projectsTable').on('click', '.editBtn', async function () {
    const projectId = $(this).data("id");

    try {
        // Fetch project details
        const projectRes = await fetch("/api/projects/getall");
        const projectData = await projectRes.json();
        const project = projectData.data.find(p => p.id === projectId);

        if (!project) throw new Error("Project not found");

        // Fill form
        $("#editProjectId").val(project.id);
        $("#editProjectName").val(project.name);
        $("#editProjectDesc").val(project.description || "");

        // Fetch employees
        const empRes = await fetch("/api/employee/newall");
        const empData = await empRes.json();
        const employees = empData.data || [];

        const select = $("#editAssignedEmployees").empty();
        employees.forEach(emp => {
            const selected = project.assignedEmployees.some(e => e.id === emp.id) ? "selected" : "";
            select.append(`<option value="${emp.id}" ${selected}>${emp.name}</option>`);
        });

        // Set status select (ensure element exists)
        try {
            const statusVal = project.status || 'Active';
            $("#editProjectStatus").val(statusVal);
        } catch (e) { }

        // Show modal
        editModal.show();

    } catch (err) {
        // console.error("Error fetching project data:", err);
        alert("Failed to load project details.");
    }
});

// Save changes
$("#saveProjectBtn").off('click').on('click', async function (e) {
    // prevent a surrounding <form> from submitting and reloading the page
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const id = $("#editProjectId").val();
    const payload = {
        name: $("#editProjectName").val(),
        description: $("#editProjectDesc").val(),
        assignedEmployeeIds: $("#editAssignedEmployees").val(),
        status: $("#editProjectStatus").val()
    };

    try {
        // console.log('[projects] saving', id, payload);

        // disable save button to prevent duplicate requests
        $(this).prop('disabled', true);

        // call the JSON API endpoint (no redirect)
        const res = await fetch(`/api/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const msg = data && data.message ? JSON.stringify(data) : `status ${res.status}`;
            throw new Error(`Failed to update project (${msg})`);
        }

        // Ensure we have a DataTable instance
        if (!table) {
            table = $('#projectsTable').DataTable();
        }

        // Hide modal using the DOM element's modal instance (robust)
        const editModalEl = document.getElementById('editProjectModal');
        const modalInstance = bootstrap.Modal.getInstance(editModalEl) || new bootstrap.Modal(editModalEl);
        modalInstance.hide();

        // Reload the full page so server-side flash (toast) is rendered
        try {
            // re-enable save button briefly (page will reload)
            $(this).prop('disabled', false);
        } catch (e) { }
        window.location.reload();

        // console.log('[projects] update successful');
        // re-enable save button
        $(this).prop('disabled', false);
        // optional user feedback
        // alert("Project updated successfully!");

    } catch (err) {
        // console.error('[projects] update error', err);
        // re-enable save button on error as well
        $(this).prop('disabled', false);
        alert("Error updating project");
    }
});

// EDIT MODAL
// $('#projectsTable').on('click', '.editBtn', function () {
//     let projectId = $(this).data("id");

//     // Fetch all projects
//     $.get("/api/projects/getall", function (res) {
//         const project = res.data.find(p => p.id === projectId);

//         $("#editProjectId").val(project.id);
//         $("#editProjectName").val(project.name);
//         $("#editProjectDesc").val(project.description || "");

//         // Fetch employees
//         $.get("/api/employee/newall", function (empRes) {
//             const employees = empRes.data || [];
//             const select = $("#editAssignedEmployees").empty();

//             employees.forEach(emp => {
//                 const selected = project.assignedEmployees.some(e => e.id === emp.id) ? "selected" : "";
//                 select.append(`<option value="${emp.id}" ${selected}>${emp.name}</option>`);
//             });

//             // Show modal
//             new bootstrap.Modal(document.getElementById('editProjectModal')).show();
//         });
//     });
// });

// // SAVE CHANGES
// $("#saveProjectBtn").click(function () {
//     const id = $("#editProjectId").val();
//     const payload = {
//         name: $("#editProjectName").val(),
//         description: $("#editProjectDesc").val(),
//         assignedEmployeeIds: $("#editAssignedEmployees").val()
//     };

//     $.ajax({
//         url: `/api/projects/update/${id}`,
//         type: "PATCH",
//         contentType: "application/json",
//         data: JSON.stringify(payload),
//         success: function () {
//             const editModalEl = document.getElementById('editProjectModal');
//             const editModal = bootstrap.Modal.getInstance(editModalEl) || new bootstrap.Modal(editModalEl);
//             editModal.hide();
//             table.ajax.reload();
//         }
//     });
// });

// Delete modal 
const deleteProjectForm = document.getElementById('deleteProjectForm');
const deleteProjectModal = document.getElementById('deleteProjectModal');

deleteProjectModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const projectId = button.getAttribute('data-id');

    document.getElementById('deleteProjectId').value = projectId;
    deleteProjectForm.action = `/api/projects/delete/${projectId}?_method=delete`;
});