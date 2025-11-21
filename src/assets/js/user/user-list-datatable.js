let previousOrderDataTable = { idx: 0, dir: 'asc' };

document.addEventListener('DOMContentLoaded', function () {
  dataTable = new DataTable('#user-table',{
  processing: true,
  serverSide: true,
  ordering: false,
  
  ajax: async function (data, callback, settings) {
    try {
      const params = {
        search: data.search.value,
        limit: data.length,
        page: Math.ceil((data.start + 1) / data.length),
      };

      let srNoSorted = false;

      if (data.order.length > 0) {
        const order = data.order[0];
        if (order.column !== 0) {
          let columnName = data.columns[order.column].data;

          params.sortBy = `${columnName}:${order.dir.toUpperCase()}`;
          previousOrderDataTable = {
            idx: order.column,
            dir: order.dir,
          };
        } else {
          // srNoSorted = {
          //   idx: settings.api.order()[0][0],
          //   dir: data.order[0].dir,
          // };
          const columnName = data.columns[previousOrderDataTable.idx].data;
          const columnDir = data.order[0].dir === 'asc' ? 'ASC' : 'DESC';
          params.sortBy = `${columnName}:${columnDir}`;
        }
      }

      const query = new URLSearchParams(params).toString();

      const response = await fetch(`/users?${query}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check if the API endpoint exists.');
      }

      const result = await response.json();

      const list = result.data || [];

      const mapped = list.map((d, i) => {
        d.row_index = srNoSorted
          ? srNoSorted.dir === 'desc'
            ? result.meta.totalItems - i - (params.page - 1) * params.limit
            : i + 1 + (params.page - 1) * params.limit
          : i + 1 + (params.page - 1) * params.limit;
        return d;
      });

      const selectDeleteButtonDiv = document.getElementById('select-row-button');
      if (selectDeleteButtonDiv) selectDeleteButtonDiv.remove();
      
      callback({
        data: mapped,
        recordsTotal: result.meta ? result.meta.totalItems : mapped.length,
        recordsFiltered: result.meta ? result.meta.totalItems : mapped.length,
      });
    } catch (error) {
      console.error('DataTable AJAX error:', error);
      callback({
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0,
        error: error.message
      });
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
            <button class="dropdown-item remove-item-btn" id="${row.id}" data-row-id="${row.id}" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal">
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

const deleteForm = document.getElementById('delete-form')
const deleteModal = document.getElementById('deleteConfirmationModal');

deleteModal.addEventListener('show.bs.modal', function (event) {
  const button = event.relatedTarget;  
  const rowId = button.getAttribute('data-row-id');

  deleteForm.action = `/users/${rowId}?_method=delete`;
});