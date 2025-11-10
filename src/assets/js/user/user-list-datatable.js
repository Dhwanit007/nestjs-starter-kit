
$(document).ready(function () {
 $('#user-table').DataTable({
  processing: true,
  serverSide: false,
  ajax: {
   url: '/users',
   type: 'GET',
   dataSrc: function (json) {
    return json.data ? json.data : [];
   }
  },
  columns: [
   { data: 'id' },
   { data: 'name' },
   { data: 'email' },
   { data: 'phoneNumber' },
   { data: 'createdAt' },
   {
    data: null,
    orderable: false,
    render: function (data, type, row) {
     return `
      <div class="dropdown d-inline-block">
        <button class="btn btn-soft-secondary btn-sm dropdown" type="button" data-bs-toggle="dropdown"
          aria-expanded="false">
          <i class="ri-more-fill align-middle"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a href="/users/${row.id}" class="dropdown-item"><i class="ri-eye-fill align-bottom me-2 text-muted"></i> View</a></li>
          <li><a href="/users/${row.id}/edit" class="dropdown-item edit-item-btn"><i class="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit</a></li>
          <li>
            <button class="dropdown-item remove-item-btn" id="${row.id}" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal">
              <i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Delete
            </button>
          </li>
        </ul>
      </div>
    `;
    }
   }
  ]
 });
});

const deleteModal = document.getElementById('deleteConfirmationModal');

deleteModal.addEventListener('show.bs.modal', async function (event) {
  const button = event.relatedTarget;
  const rowId = button.id;

  const confirmBtn = document.getElementById('delete-confirmation');
  confirmBtn.onclick = async () => {
    const response = await fetch(`/users/${rowId}`, {
      method: "DELETE"
    })

    if (!(response.ok)) {
      Toastify({
        text: "Delete Failed!",
        duration: 3000,
        gravity: "top",
        position: "right",
        close: "close"
      }).showToast();
    }

  };
});