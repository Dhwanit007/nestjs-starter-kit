let table;

$(document).ready(function () {

    table = $('#employeesTable').DataTable({
        serverSide: true,
        processing: true,
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.childRowImmediate,
                type: ''
            }
        },
        autoWidth: false,

        ajax: {
            url: '/employee/newall',
            data: function (data) {
                const params = {
                    search: data.search.value,
                    limit: data.length,
                    page: Math.ceil((data.start + 1) / data.length),
                };

                if (data.order.length > 0) {
                    const order = data.order[0];
                    let columnName = data.columns[order.column].data;

                    if (columnName && columnName !== "null" && columnName !== "") {
                        params.sortBy = `${columnName}:${order.dir.toUpperCase()}`;
                    }
                }

                return params;
            }
        },

        // 🔥 Disable sorting for no-sort columns
        columnDefs: [
            { targets: "no-sort", orderable: false }
        ],

        columns: [
            {
                sortable: false,
                orderable: false,
                data: null,
                render: row => `<input type="checkbox" class="row-checkbox" value="${row.id}">`
            },
            {
                orderable: false,
                data: null,
                render: (data, type, row, meta) =>
                    meta.row + 1 + meta.settings._iDisplayStart
            },
            { data: 'id' },
            { data: 'name' },
            {
                data: 'email', render: function (email) {
                    return `<span class="badge bg-info text-dark">${email}</span>`
                }
            },
            { data: 'role' },
            {
                data: 'created_at',
                render: data => new Date(data).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })
            },
            {
                data: 'department',
                render: function (dept) {
                    return dept ? `<span data-dept-id="${dept.id}">${dept.name}</span>` : 'N/A';
                }
            },
            {
                data: null,
                render: function (data) {
                    return `
                            <button class="btn btn-sm btn-primary edit-btn"
                                data-id="${data.id}"
                                data-name="${data.name}"
                                data-email="${data.email}"
                                data-role="${data.role}"
                                data-department-id="${data.department ? data.department.id : ''}">
                                Edit
                            </button>

                            <button 
    class="btn btn-danger btn-sm"
    data-bs-toggle="modal"
    data-bs-target="#deleteConfirmationModal"
    data-row-id="${data.id}"
>
    Delete
</button>`;
                }
            }
        ]
    });

    // SELECT ALL
    $('#selectAll').on('change', function () {
        $('.row-checkbox').prop('checked', $(this).is(':checked'));
    });

    // Add Employee Form logic to submit
    $(document).on('click', '.add-btn', function () {
        $('#addEmployeeModal').modal('show')
    })

    const deleteform = document.getElementById('delete-form')
    const deleteModal = document.getElementById('deleteConfirmationModal')

    deleteModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const rowId = button.getAttribute('data-row-id');

        deleteform.action = `/employee/delete/${rowId}`;
    })

    $(document).on('click', '.edit-btn', async function () {
        const id = $(this).data('id');

        // Fill inputs
        $('#edit-id').val(id);
        $('#edit-name').val($(this).data('name'));
        $('#edit-email').val($(this).data('email'));
        $('#edit-role').val($(this).data('role'));

        const selectedDeptId = $(this).data('department-id');

        // Fetch departments
        const res = await fetch('/departments/all').then(r => r.json());

        // Convert payload object → array
        const departments = Object.values(res.payload);

        // console.log("Converted departments:", departments);

        // Build option list
        const deptOptions = `<option value="">-- Select Department --</option>` + departments
            .map(d => `<option value="${d.id}" ${d.id === selectedDeptId ? 'selected' : ''}>${d.name}</option>`)
            .join('');

        $('#edit-department').html(deptOptions);

        // Set form action
        $('#editEmployeeForm').attr('action', `/employee/update/${id}`);

        $('#editEmployeeModal').modal('show');
    });


    $('#deleteSelectedBtn').click(function () {
        const ids = $('.row-checkbox:checked').map(function () {
            return this.value;
        }).get();

        if (ids.length === 0) {
            alert("Please select at least one employee.");
            return;
        }

        if (!confirm(`Delete ${ids.length} employee(s)?`)) return;

        $.ajax({
            url: '/employee/delete-multiple',
            method: 'POST',
            data: JSON.stringify({ ids }),
            contentType: 'application/json',
            success: function () {
                table.ajax.reload();
                $('#selectAll').prop('checked', false);
            }
        });
    });
});
