let table;

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

// EDIT MODAL
$('#projectsTable').on('click', '.editBtn', function () {
    let projectId = $(this).data("id");

    // Fetch all projects
    $.get("/api/projects/getall", function (res) {
        const project = res.data.find(p => p.id === projectId);

        $("#editProjectId").val(project.id);
        $("#editProjectName").val(project.name);
        $("#editProjectDesc").val(project.description || "");

        // Fetch employees
        $.get("/api/employee/newall", function (empRes) {
            const employees = empRes.data || [];
            const select = $("#editAssignedEmployees").empty();

            employees.forEach(emp => {
                const selected = project.assignedEmployees.some(e => e.id === emp.id) ? "selected" : "";
                select.append(`<option value="${emp.id}" ${selected}>${emp.name}</option>`);
            });

            // Show modal
            new bootstrap.Modal(document.getElementById('editProjectModal')).show();
        });
    });
});

// SAVE CHANGES
$("#saveProjectBtn").click(function () {
    const id = $("#editProjectId").val();
    const payload = {
        name: $("#editProjectName").val(),
        description: $("#editProjectDesc").val(),
        assignedEmployeeIds: $("#editAssignedEmployees").val()
    };

    $.ajax({
        url: `/api/projects/update/${id}`,
        type: "PATCH",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function () {
            $("#editProjectModal").modal("hide");
            table.ajax.reload(null, false);
            alert("Project updated successfully!");
        }
    });
});

// Delete modal 
const deleteProjectForm = document.getElementById('deleteProjectForm');
const deleteProjectModal = document.getElementById('deleteProjectModal');

deleteProjectModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const projectId = button.getAttribute('data-id');

    document.getElementById('deleteProjectId').value = projectId;
    deleteProjectForm.action = `/api/projects/delete/${projectId}?_method=delete`;
});