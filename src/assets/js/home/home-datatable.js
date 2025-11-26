let dataTable
let previousOrderDataTable = { idx: 0, dir: 'asc' };

document.addEventListener('DOMContentLoaded', function () {
  dataTable = new DataTable('#user-table',{
        reponsive: true,
        pageLength: 5,

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
              // console.error('Response is not JSON:', text.substring(0, 200));
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
            // console.error('DataTable AJAX error:', error);
            callback({
              data: [],
              recordsTotal: 0,
              recordsFiltered: 0,
              error: error.message
            });
          }
        },

        serverSide: true,
        processing: true,
        order: [[5, 'asc']],

        columns: [
          { data: null, defaultContent: '', orderable: false },
          { data: 'row_index', defaultContent: '1', title: 'Sr. no.' },
          { data: 'id', title: 'ID', orderable: false },
          { data: 'name', title: 'Name', updatable: true },
          { data: 'dob', title: 'DOB', updatable: false, render: function (d) { return d ? new Date(d).toLocaleDateString() : ''; } },
          { data: 'language', title: 'Language', updatable: true },
          { data: 'gender', title: 'Gender', updatable: true },
          { data: 'createdAt', title: 'Created At', render: function (d) { return d ? new Date(d).toLocaleString() : ''; } },
          {
            title: 'Actions', defaultContent: `
                          <div class="d-flex gap-2 justify-content-start align-items-center">
                            <span class="fa fa-times cursor-pointer" style="display: none;" onclick="updateData(true)"></span>
                            <span class="fa fa-pencil cursor-pointer" onclick="updateData()"></span>
                            <span class="fa fa-trash cursor-pointer" onclick="deleteRow()"></span>
                          </div>
                          `, 
            createdCell: function (cell, cellData, rowData, rowIndex) { 
              cell.id = `${rowData.id}_${rowIndex}`; 
            }, 
            orderable: false 
          },
        ],
        columnDefs: [
          {
            render: DataTable.render.select(),
            targets: 0,
          }
        ],
        select: {
          style: 'multi',
          selector: 'td:first-child',
        },

        on: {
          select: function (e, dt, type, indexes) {
            // here dt is api object here
            if (type === 'row') {
              const rows = dt.rows({ selected: true }).data().toArray();
              function createDiv() {
       
                const layout = dt.table().container().querySelector('[class*="row"]');
                const buttonDiv = document.createElement('div');
                buttonDiv.id = 'select-row-button';
                buttonDiv.innerHTML = `
                      <button
                        class="btn btn-danger btn-sm"
                        onclick="getSelectedRows()"
                      >
                        Delete Selected (1)
                      </button>
                      `;
                layout.insertBefore(buttonDiv, layout.children[1]);
                return buttonDiv;
              }
              let buttonDiv = document.getElementById('select-row-button');
              if (!buttonDiv) {
                buttonDiv = createDiv();
              }
              buttonDiv.children[0].textContent = `Delete Selected (${rows.length})`;
            }
          },
          deselect: function (e, dt, type, indexes) {
            if (type === 'row') {
              const rows = dt.rows({ selected: true }).data().toArray();
              const buttonDiv = document.getElementById('select-row-button');
              if (rows.length === 0) {
                buttonDiv.remove();
              } else {
                buttonDiv.children[0].textContent = `Delete Selected (${rows.length})`;
              }
            }
          },
        },
      });
    });

    async function deleteRow() {
      const tableRow = event.target.closest('tr');
      const id = event.target.parentElement.parentElement.id.split('_')[0];

      const confirmation = confirm(`Are you sure you want to delete id ${id}`);

      if (confirmation) {
        const deleteRequest = await fetch(`/api/user2/${id}`, { method: 'DELETE' });
        if (deleteRequest.ok) {
          tableRow.remove();
        } else {
          alert(`Error while deleting: ${(await deleteRequest.json()).message}`);
        }
      }
    }

    async function updateData(cancel = false) {
      const columns = dataTable
        .settings()[0]
        .aoColumns.filter((col) => col.updatable)
        .map((col) => ({ name: col.data, idx: col.idx }));

      const tableRow = event.target.closest('tr');

      if (event.target.classList.contains('fa-pencil')) {
        for (const column of columns) {
          const element = tableRow.children[column.idx];

          column.value = element.innerText;

          element.innerHTML = `<input type="text" id="${column.value}" value="${column.value}" class="form-control form-control-sm" />`;
        }
        const id = event.target.parentElement.parentElement.id.split('_')[0];

        event.target.id = `confirm-Btn-${id}`;
        const cancelButton = tableRow.querySelector('.fa-times');
        cancelButton.style.display = 'inline-block';
        event.target.className = 'fa fa-check cursor-pointer';
      } else {
        const payload = {};
        const elements = [];
        const id = event.target.parentElement.parentElement.id.split('_')[0];
        for (const column of columns) {
          const element = tableRow.children[column.idx];

          const elementValue = element.children[0].value;

          elements.push(element);
          if (element.children[0].id != elementValue) {
            payload[column.name] = elementValue;
          }
        }

        let updateResponse;
        if (Object.keys(payload).length > 0 && !cancel) {
          updateResponse = await fetch(`/api/user2/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          updateResponse = { ok: true };
        }

        if (updateResponse.ok) {
          elements.forEach((element) => {
            element.innerHTML = !cancel ? element.children[0].value : element.children[0].id;
          });
          const cancelButton = tableRow.querySelector('.fa-times');
          cancelButton.style.display = 'none';
          if (cancel) {
            const confirmBtn = document.getElementById(`confirm-Btn-${id}`);
            confirmBtn.className = 'fa fa-pencil cursor-pointer';
          } else {
            event.target.className = 'fa fa-pencil cursor-pointer';
          }
        } else {
          alert(`Error while update: ${(await updateResponse.json()).message}`);
        }
      }
    }