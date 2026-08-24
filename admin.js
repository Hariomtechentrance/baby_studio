const tokenKey = 'babyStudioAdminToken';
let token = localStorage.getItem(tokenKey);
let setupMode = false;
const request = (url, options = {}) => fetch(url, { ...options, headers: { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
const escapeHtml = (value = '') => {
  const el = document.createElement('span');
  el.textContent = value;
  return el.innerHTML;
};
function showAuth(configured) {
  setupMode = !configured;
  document.getElementById('authView').hidden = false;
  document.getElementById('dashboardView').hidden = true;
  document.getElementById('authTitle').textContent = setupMode ? 'Create your admin account' : 'Welcome back';
  document.getElementById('authDescription').textContent = setupMode ? 'This one-time setup protects your studio data. Use a strong password of 12 characters or more.' : 'Sign in to manage clients and your public portfolio.';
  document.getElementById('authButton').textContent = setupMode ? 'Create secure account' : 'Sign in';
  document.getElementById('confirmWrap').hidden = !setupMode;
}
function setActiveSection(section) {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === section);
  });
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${section}`);
  });
}
function renderOverview(db) {
  const inquirySection = document.getElementById('overviewEnquiries');
  const photoSection = document.getElementById('overviewPhotos');
  const enquiries = db.inquiries.slice(0, 3);
  const photos = db.photos.slice(0, 3);
  inquirySection.innerHTML = enquiries.length ? enquiries.map((item) => `
    <div class="overview-entry">
      <strong>${escapeHtml(item.parentName)}</strong>
      <span>${escapeHtml(item.sessionType)} · ${escapeHtml(item.sessionDate || 'No date')}</span>
      <span>${escapeHtml(item.email)} · ${escapeHtml(item.mobileNumber)}</span>
      <span>Status: ${escapeHtml(item.status)}</span>
    </div>
  `).join('') : '<p class="muted">No enquiries yet.</p>';
  photoSection.innerHTML = photos.length ? photos.map((photo) => `
    <div class="overview-entry">
      <strong>${escapeHtml(photo.title || 'Untitled')}</strong>
      <span>${escapeHtml(photo.category)}</span>
      <span>${escapeHtml(photo.imageUrl)}</span>
      <span>${photo.published ? 'Published' : 'Hidden'}</span>
    </div>
  `).join('') : '<p class="muted">No published photos yet.</p>';
}
function renderPhotos(db) {
  const photos = document.getElementById('photos');
  photos.innerHTML = db.photos.length ? db.photos.map((photo) => {
    const published = photo.published === 1 || photo.published === true || photo.published === '1';
    return `
      <article class="photo">
        <img src="${escapeHtml(photo.imageUrl)}" alt="${escapeHtml(photo.alt)}">
        <div class="photo-meta">
          <div class="photo-title">${escapeHtml(photo.title)}</div>
          <div class="photo-label">${escapeHtml(photo.category)}</div>
          <div class="photo-status">${published ? 'Published' : 'Hidden'}</div>
          <div class="photo-actions">
            <button class="secondary" data-action="toggle" data-id="${photo.id}" data-published="${published ? '1' : '0'}">${published ? 'Unpublish' : 'Publish'}</button>
            <button class="secondary danger" data-action="delete" data-id="${photo.id}">Delete</button>
          </div>
        </div>
      </article>`;
  }).join('') : '<p class="muted">No photos published yet.</p>';
  photos.querySelectorAll('button[data-action]').forEach((button) => {
    const id = button.dataset.id;
    if (button.dataset.action === 'delete') {
      button.addEventListener('click', async () => {
        if (!confirm('Delete this photo permanently?')) return;
        await request(`/api/admin/photos/${id}`, { method: 'DELETE' });
        loadDashboard();
      });
    }
    if (button.dataset.action === 'toggle') {
      button.addEventListener('click', async () => {
        const published = button.dataset.published === '1';
        await request(`/api/admin/photos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !published }) });
        loadDashboard();
      });
    }
  });
}
function renderBookings(db) {
  document.getElementById('totalClientsTable').textContent = db.inquiries.length;
  const tbody = document.getElementById('inquiries');
  tbody.innerHTML = db.inquiries.length ? db.inquiries.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.parentName)}</strong><br><span>${escapeHtml(item.email)}</span></td>
      <td>${escapeHtml(item.sessionType)}<br><small>${escapeHtml(item.babyName ? `${item.babyName} ${item.babyAge}` : 'No baby details')}</small></td>
      <td>${escapeHtml(item.mobileNumber)}</td>
      <td><select class="status-select" data-id="${item.id}">${['new','contacted','booked','closed'].map((status) => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
      <td>${escapeHtml(item.sessionDate || 'TBD')}</td>
    </tr>`).join('') : '<tr><td colspan="5" class="muted">No enquiries available.</td></tr>';
  tbody.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', async () => {
      await request(`/api/admin/inquiries/${select.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: select.value }) });
      loadDashboard();
    });
  });
}
async function loadDashboard() {
  const response = await request('/api/admin/dashboard');
  if (!response.ok) {
    localStorage.removeItem(tokenKey);
    token = '';
    return start();
  }
  const db = await response.json();
  document.getElementById('authView').hidden = true;
  document.getElementById('dashboardView').hidden = false;
  document.getElementById('totalClients').textContent = db.inquiries.length;
  document.getElementById('totalClientsCard').textContent = db.inquiries.length;
  document.getElementById('newClients').textContent = db.inquiries.filter((item) => item.status === 'new').length;
  document.getElementById('photoCount').textContent = db.photos.filter((item) => item.published === 1 || item.published === true).length;
  document.getElementById('overviewEnquiries').innerHTML = '';
  document.getElementById('overviewPhotos').innerHTML = '';
  renderOverview(db);
  renderPhotos(db);
  renderBookings(db);
  setActiveSection('overview');
}
async function start() {
  const response = await fetch('/api/admin/status');
  const status = await response.json();
  if (token) return loadDashboard();
  showAuth(status.configured);
}
document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => setActiveSection(button.dataset.section));
});
document.getElementById('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const error = document.getElementById('authError');
  error.textContent = '';
  if (setupMode && data.password !== data.confirmPassword) return error.textContent = 'Passwords do not match.';
  const response = await fetch(setupMode ? '/api/admin/setup' : '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) return error.textContent = result.error || 'Something went wrong.';
  if (setupMode) {
    form.reset();
    return showAuth(true);
  }
  token = result.token;
  localStorage.setItem(tokenKey, token);
  loadDashboard();
});
document.getElementById('photoForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const note = document.getElementById('photoMessage');
  const imageUrl = form.imageUrl.value.trim();
  if (!imageUrl) return note.textContent = 'Enter an image URL.';
  note.textContent = 'Saving…';
  const response = await request('/api/admin/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl, title: form.title.value, category: form.category.value, alt: form.alt.value }) });
  const result = await response.json();
  note.textContent = response.ok ? 'Photo published to the public portfolio.' : result.error;
  if (response.ok) { form.reset(); loadDashboard(); }
});
document.getElementById('signOut').addEventListener('click', async () => {
  await request('/api/admin/logout', { method: 'POST' });
  localStorage.removeItem(tokenKey);
  token = '';
  start();
});
start();
