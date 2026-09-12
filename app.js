const storageKey = 'voyage-crm-customers';
const starterCustomers = [
  { id: '1', company: 'Atlas Home Supplies', country: '美国', contact: 'Michael Chen', product: '户外家具', whatsapp: '+1 415 555 0198', needs: '需要 40HQ 报价，关注交货期。', status: '待跟进' },
  { id: '2', company: 'Nordic Living AB', country: '瑞典', contact: 'Sofia Andersson', product: '餐桌椅', whatsapp: '+46 70 123 4567', needs: '正在确认样品颜色和包装方案。', status: '已跟进' },
  { id: '3', company: 'Casa Bonita', country: '墨西哥', contact: 'Carlos Ruiz', product: '休闲沙发', whatsapp: '+52 55 1234 5678', needs: '首单 200 套，已确认 PI。', status: '已成交' }
];
let customers = JSON.parse(localStorage.getItem(storageKey) || 'null') || starterCustomers;
const $ = (selector) => document.querySelector(selector);
const table = $('#customer-table'); const dialog = $('#customer-dialog'); const form = $('#customer-form');

function save() { localStorage.setItem(storageKey, JSON.stringify(customers)); }
function escapeHtml(value = '') { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function statusClass(status) { return `status-${status}`; }
function render() {
  const query = $('#search-input').value.trim().toLowerCase(); const country = $('#country-filter').value; const status = $('#status-filter').value;
  const countries = [...new Set(customers.map(c => c.country).filter(Boolean))].sort();
  $('#country-filter').innerHTML = '<option value="">全部国家</option>' + countries.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
  $('#country-filter').value = country;
  const visible = customers.filter(c => (!country || c.country === country) && (!status || c.status === status) && (!query || [c.company,c.country,c.contact,c.product,c.whatsapp,c.needs].join(' ').toLowerCase().includes(query)));
  table.innerHTML = visible.map(c => `<tr><td><span class="company-name">${escapeHtml(c.company)}</span><span class="tiny">${escapeHtml(c.contact)}</span></td><td>${escapeHtml(c.country || '—')}</td><td>${escapeHtml(c.contact)}</td><td>${escapeHtml(c.product || '—')}</td><td>${escapeHtml(c.whatsapp || '—')}</td><td><span class="need-text" title="${escapeHtml(c.needs)}">${escapeHtml(c.needs || '—')}</span></td><td><button class="status-button ${statusClass(c.status)}" data-action="status" data-id="${c.id}" title="点击切换状态">${c.status}</button></td><td><button class="action-button" data-action="edit" data-id="${c.id}">编辑</button><button class="action-button delete" data-action="delete" data-id="${c.id}">删除</button></td></tr>`).join('');
  $('#empty-state').hidden = visible.length > 0;
  $('#total-count').textContent = customers.length; $('#pending-count').textContent = customers.filter(c => c.status === '待跟进').length; $('#followed-count').textContent = customers.filter(c => c.status === '已跟进').length; $('#won-count').textContent = customers.filter(c => c.status === '已成交').length;
}
function openDialog(customer) { form.reset(); $('#customer-id').value = customer?.id || ''; $('#dialog-title').textContent = customer ? '编辑客户' : '添加客户'; if (customer) ['company','country','contact','product','whatsapp','needs','status'].forEach(key => $(`#${key}`).value = customer[key] || ''); dialog.showModal(); }
$('#open-add').addEventListener('click', () => openDialog()); $('#close-dialog').addEventListener('click', () => dialog.close()); $('#cancel-dialog').addEventListener('click', () => dialog.close());
['search-input','country-filter','status-filter'].forEach(id => $(`#${id}`).addEventListener('input', render));
form.addEventListener('submit', event => { event.preventDefault(); const id = $('#customer-id').value; const record = Object.fromEntries(new FormData(form)); ['company','country','contact','product','whatsapp','needs','status'].forEach(key => record[key] = $(`#${key}`).value.trim()); record.id = id || String(Date.now()); if (id) customers = customers.map(c => c.id === id ? record : c); else customers.unshift(record); save(); dialog.close(); render(); });
table.addEventListener('click', event => { const button = event.target.closest('button[data-action]'); if (!button) return; const id = button.dataset.id; const index = customers.findIndex(c => c.id === id); if (button.dataset.action === 'edit') openDialog(customers[index]); if (button.dataset.action === 'delete' && confirm(`确定删除“${customers[index].company}”吗？`)) { customers.splice(index, 1); save(); render(); } if (button.dataset.action === 'status') { const sequence = ['待跟进','已跟进','已成交']; customers[index].status = sequence[(sequence.indexOf(customers[index].status) + 1) % sequence.length]; save(); render(); } });
render();
