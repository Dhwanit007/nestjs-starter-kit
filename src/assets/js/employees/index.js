let table;

$(document).ready(function () {

    table = $('#employeesTable').DataTable({
        serverSide: true,
        processing: true,

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
                    params.sortBy = `${columnName}:${order.dir.toUpperCase()}`;
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
                render: data => new Date(data).toDateString()
            },
            {
                data: 'department',
                render: function (dept) {
                    return dept ? dept.name : 'N/A';
                }
            },
            {
                data: null,
                render: function (data) {
                    return `
                            <button class="btn btn-sm btn-primary edit-btn"
                                data-id="${data.id}"
                                data-name="${data.name}"
                                data-email="${data.email}">
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

    // OPEN EDIT MODAL
    $(document).on('click', '.edit-btn', function () {


        const id = $(this).data('id');
        const name = $(this).data('name');
        const email = $(this).data('email');

        $('#edit-id').val(id);
        $('#edit-name').val(name);
        $('#edit-email').val(email);

        $('#editEmployeeForm').attr('action', `/employee/update/${id}`);

        $('#editEmployeeModal').modal('show');
    });

    // Delete modal and submit logic
    const deleteform = document.getElementById('delete-form')
    const deleteModal = document.getElementById('deleteConfirmationModal')

    deleteModal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const rowId = button.getAttribute('data-row-id');

        deleteform.action = `/employee/delete/${rowId}`;
    })

    // Edit modal and submit logic
    const editForm = document.getElementById('editEmployeeForm')
    const editModal = document.getElementById('editEmployeeModal')

    editModal.addEventListener('show.bs.modal', function (edit) {
        const button = edit.relatedTarget;
        const rowId = button.getAttribute('data-row-id');

        editForm.action = `/employee/update/${rowId}`
    })


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
