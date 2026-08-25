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
let allPhotos = [];
function renderPhotos(photoList) {
  const photos = document.getElementById('photos');
  photos.innerHTML = photoList.length ? photoList.map((photo) => {
    const published = photo.published === 1 || photo.published === true || photo.published === '1';
    const isCover = photo.isCover === 1 || photo.isCover === true;
    const inStory = photo.showInStory === 1 || photo.showInStory === true;
    return `
      <article class="photo" data-published="${published ? '1' : '0'}">
        <img src="${escapeHtml(photo.imageUrl)}" alt="${escapeHtml(photo.alt)}">
        <div class="photo-meta">
          ${isCover ? '<span class="photo-cover-badge">★ Homepage cover</span>' : ''}
          ${inStory ? '<span class="photo-story-badge">◆ In Our Story</span>' : ''}
          <div class="photo-title">${escapeHtml(photo.title)}</div>
          <div class="photo-label">${escapeHtml(photo.category)}</div>
          <div class="photo-status">${published ? 'Published' : 'Hidden'}</div>
          <div class="photo-actions">
            <button class="secondary" data-action="toggle" data-id="${photo.id}" data-published="${published ? '1' : '0'}">${published ? 'Unpublish' : 'Publish'}</button>
            <button class="secondary danger" data-action="delete" data-id="${photo.id}">Delete</button>
          </div>
          <div class="photo-actions">
            <button class="secondary" data-action="cover" data-id="${photo.id}" data-cover="${isCover ? '1' : '0'}">${isCover ? 'Remove as cover' : 'Set as homepage cover'}</button>
          </div>
          <div class="photo-actions">
            <button class="secondary" data-action="story" data-id="${photo.id}" data-story="${inStory ? '1' : '0'}">${inStory ? 'Remove from Our Story' : 'Add to Our Story'}</button>
          </div>
        </div>
      </article>`;
  }).join('') : '<p class="muted">No photos in this section yet.</p>';
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
    if (button.dataset.action === 'cover') {
      button.addEventListener('click', async () => {
        const isCover = button.dataset.cover === '1';
        await request(`/api/admin/photos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isCover: !isCover }) });
        loadDashboard();
      });
    }
    if (button.dataset.action === 'story') {
      button.addEventListener('click', async () => {
        const inStory = button.dataset.story === '1';
        if (!inStory) {
          const currentCount = allPhotos.filter((p) => p.showInStory === 1 || p.showInStory === true).length;
          if (currentCount >= 12 && !confirm('Our Story already shows 12 photos on the homepage. Add this one anyway? (Remove another first if you want it to display.)')) return;
        }
        await request(`/api/admin/photos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ showInStory: !inStory }) });
        loadDashboard();
      });
    }
  });
}
function applyPhotoFilter() {
  const filter = document.getElementById('photoCategoryFilter').value;
  renderPhotos(filter ? allPhotos.filter((p) => p.category === filter) : allPhotos);
}
document.getElementById('photoCategoryFilter').addEventListener('change', applyPhotoFilter);
function renderBookings(db) {
  document.getElementById('totalClientsTable').textContent = db.inquiries.length;
  const tbody = document.getElementById('inquiries');
  tbody.innerHTML = db.inquiries.length ? db.inquiries.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.parentName)}</strong><br><span>${escapeHtml(item.email)}</span></td>
      <td>${escapeHtml(item.sessionType)}<br><small>${escapeHtml(item.babyName ? `${item.babyName} ${item.babyAge}` : 'No baby details')}</small></td>
      <td>${escapeHtml(item.mobileNumber)}</td>
      <td><select class="status-select" data-id="${item.id}" data-status="${item.status}">${['new','contacted','booked','closed'].map((status) => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
      <td>${escapeHtml(item.sessionDate || 'TBD')}</td>
      <td><button class="secondary danger" data-action="delete-inquiry" data-id="${item.id}">Delete</button></td>
    </tr>`).join('') : '<tr><td colspan="6" class="muted">No enquiries available.</td></tr>';
  tbody.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', async () => {
      select.dataset.status = select.value;
      await request(`/api/admin/inquiries/${select.dataset.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: select.value }) });
      loadDashboard();
    });
  });
  tbody.querySelectorAll('[data-action="delete-inquiry"]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this enquiry permanently?')) return;
      await request(`/api/admin/inquiries/${button.dataset.id}`, { method: 'DELETE' });
      loadDashboard();
    });
  });
}
function animateCount(el, target) {
  const from = Number(el.textContent) || 0;
  if (from === target) { el.textContent = target; return; }
  const duration = 500;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
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
  animateCount(document.getElementById('totalClients'), db.inquiries.length);
  animateCount(document.getElementById('totalClientsCard'), db.inquiries.length);
  animateCount(document.getElementById('newClients'), db.inquiries.filter((item) => item.status === 'new').length);
  animateCount(document.getElementById('photoCount'), db.photos.filter((item) => item.published === 1 || item.published === true).length);
  document.getElementById('overviewEnquiries').innerHTML = '';
  document.getElementById('overviewPhotos').innerHTML = '';
  renderOverview(db);
  allPhotos = db.photos;
  applyPhotoFilter();
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
  setToast(error, '');
  if (setupMode && data.password !== data.confirmPassword) return setToast(error, 'Passwords do not match.', 'error');
  const response = await fetch(setupMode ? '/api/admin/setup' : '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) return setToast(error, result.error || 'Something went wrong.', 'error');
  if (setupMode) {
    form.reset();
    return showAuth(true);
  }
  token = result.token;
  localStorage.setItem(tokenKey, token);
  loadDashboard();
});
function setToast(el, text, type) {
  el.textContent = text;
  el.classList.remove('success', 'error');
  if (type) el.classList.add(type);
  el.classList.toggle('show', Boolean(text));
  clearTimeout(el._toastTimer);
  if (type === 'success') el._toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
}
document.getElementById('photoForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const note = document.getElementById('photoMessage');
  const imageUrl = form.imageUrl.value.trim();
  if (!imageUrl) return setToast(note, 'Enter an image URL.', 'error');
  setToast(note, 'Saving…');
  const response = await request('/api/admin/photos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl, title: form.title.value, category: form.category.value, alt: form.alt.value }) });
  const result = await response.json();
  setToast(note, response.ok ? 'Photo published to the public portfolio.' : result.error, response.ok ? 'success' : 'error');
  if (response.ok) {
    form.reset();
    resetPreview();
    loadDashboard();
  }
});
const previewBox = document.getElementById('uploadPreview');
const previewImg = document.getElementById('uploadPreviewImg');
const previewHint = document.getElementById('uploadPreviewHint');
function resetPreview() {
  if (!previewBox) return;
  previewBox.classList.remove('has-image');
  previewImg.hidden = true;
  previewImg.removeAttribute('src');
  previewHint.hidden = false;
}
const previewUrlInput = document.querySelector('#photoForm [name="imageUrl"]');
if (previewUrlInput) {
  previewUrlInput.addEventListener('input', () => {
    const value = previewUrlInput.value.trim();
    if (!/^https?:\/\/.+\.(?:jpe?g|png|webp)(?:[?#].*)?$/i.test(value)) return resetPreview();
    previewImg.onload = () => {
      previewBox.classList.add('has-image');
      previewImg.hidden = false;
      previewHint.hidden = true;
    };
    previewImg.onerror = () => resetPreview();
    previewImg.src = value;
  });
}
document.getElementById('signOut').addEventListener('click', async () => {
  await request('/api/admin/logout', { method: 'POST' });
  localStorage.removeItem(tokenKey);
  token = '';
  start();
});
start();
