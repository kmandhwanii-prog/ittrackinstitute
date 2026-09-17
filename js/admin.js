/**
 * IT TRACK INSTITUTE - ADMIN CONTROLLER
 * Full administrative features: Supabase Auth, Course CRUD,
 * Application lifecycle management, Inquiries, and Live Backend Configuration.
 */

let currentAdminTab = 'overview';
let adminCourses = [];
let adminApplications = [];
let adminInquiries = [];
let adminAnnouncements = [];

document.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  setupSidebarNav();
  setupHashRouting();
  await refreshBackendStatus();
  await reloadAllData();
});

// ==============================================================================
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ==============================================================================

function checkAuth() {
  const isLogged = localStorage.getItem('it_track_admin_logged_in');
  const authOverlay = document.getElementById('auth-overlay');
  const adminApp = document.getElementById('admin-app');

  if (isLogged === 'true') {
    authOverlay.style.display = 'none';
    adminApp.style.display = 'flex';
  } else {
    authOverlay.style.display = 'flex';
    adminApp.style.display = 'none';
  }
}

window.handleAdminLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login_email').value.trim();
  const password = document.getElementById('login_password').value;
  const submitBtn = document.getElementById('login-submit-btn');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying Credentials...';

  const client = window.supabase && typeof window.supabase.createClient === 'function' 
    ? window.ITTrackDB.getCredentials().isConfigured 
      ? window.supabase.createClient(window.ITTrackDB.getCredentials().url, window.ITTrackDB.getCredentials().anonKey) 
      : null 
    : null;

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        localStorage.setItem('it_track_admin_logged_in', 'true');
        localStorage.setItem('it_track_admin_email', data.user.email);
        document.getElementById('admin-display-email').textContent = data.user.email;
        showAdminToast('Welcome back!', 'Authenticated via Supabase Auth.', 'success');
        checkAuth();
        await reloadAllData();
        return;
      }
    } catch (err) {
      console.warn('Supabase auth login check:', err);
    }
  }

  // Fallback demo/mock authentication
  if (email && password) {
    localStorage.setItem('it_track_admin_logged_in', 'true');
    localStorage.setItem('it_track_admin_email', email);
    document.getElementById('admin-display-email').textContent = email;
    showAdminToast('Admin Authenticated', 'Logged in successfully.', 'success');
    checkAuth();
    await reloadAllData();
  } else {
    showAdminToast('Login Error', 'Invalid username or password.', 'error');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Sign In to Admin Panel';
};

window.quickDemoLogin = function() {
  localStorage.setItem('it_track_admin_logged_in', 'true');
  localStorage.setItem('it_track_admin_email', 'admin@ittrackinstitute.edu');
  document.getElementById('admin-display-email').textContent = 'admin@ittrackinstitute.edu';
  showAdminToast('Demo Mode Activated', 'Logged in with Super Admin privileges.', 'success');
  checkAuth();
  reloadAllData();
};

window.handleAdminLogout = async function() {
  const creds = window.ITTrackDB.getCredentials();
  if (creds.isConfigured && window.supabase) {
    try {
      const client = window.supabase.createClient(creds.url, creds.anonKey);
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
  }

  localStorage.removeItem('it_track_admin_logged_in');
  localStorage.removeItem('it_track_admin_email');
  showAdminToast('Signed Out', 'You have been logged out of the admin panel.', 'info');
  checkAuth();
};

// ==============================================================================
// 2. SIDEBAR NAVIGATION & TABS
// ==============================================================================

function setupSidebarNav() {
  const navItems = document.querySelectorAll('.sidebar-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function setupHashRouting() {
  const hash = window.location.hash.replace('#', '');
  if (hash && ['overview', 'courses', 'applications', 'inquiries', 'announcements', 'settings'].includes(hash)) {
    switchTab(hash);
  }
}

window.switchTab = function(tabId) {
  currentAdminTab = tabId;
  window.location.hash = tabId;

  // Update nav highlight
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  // Update tab visibility
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) activePane.classList.add('active');

  // Update heading & quick action
  const heading = document.getElementById('topbar-heading');
  const actionBtn = document.getElementById('quick-action-btn');

  const titles = {
    overview: 'Executive Dashboard',
    courses: 'Course Curriculum Management',
    applications: 'Student Enrollment Applications',
    inquiries: 'Student Inquiries & Communication',
    announcements: 'Notice Board & Alerts',
    settings: 'Supabase Backend Settings'
  };
  heading.textContent = titles[tabId] || 'Admin Portal';

  if (tabId === 'courses') {
    actionBtn.style.display = 'inline-flex';
    actionBtn.innerHTML = '+ New Course';
    actionBtn.onclick = openAddCourseModal;
  } else if (tabId === 'announcements') {
    actionBtn.style.display = 'inline-flex';
    actionBtn.innerHTML = '+ Post Notice';
    actionBtn.onclick = openAddAnnouncementModal;
  } else {
    actionBtn.style.display = 'none';
  }
};

// ==============================================================================
// 3. DATA FETCHING & SYNCHRONIZATION
// ==============================================================================

async function reloadAllData() {
  try {
    const [coursesRes, appsRes, inqRes, annRes] = await Promise.all([
      window.ITTrackDB.getCourses(),
      window.ITTrackDB.getApplications(),
      window.ITTrackDB.getInquiries(),
      window.ITTrackDB.getAnnouncements()
    ]);

    adminCourses = coursesRes.data || [];
    adminApplications = appsRes.data || [];
    adminInquiries = inqRes.data || [];
    adminAnnouncements = annRes.data || [];

    updateCounts();
    renderOverview();
    renderCoursesTable();
    renderApplicationsTable();
    renderInquiriesTable();
    renderAnnouncementsTable();
    populateSettingsInputs();
  } catch (err) {
    console.error('Error reloading admin data:', err);
    showAdminToast('Sync Error', 'Could not refresh some dashboard records.', 'error');
  }
}

function updateCounts() {
  document.getElementById('sidebar-courses-count').textContent = adminCourses.length;
  document.getElementById('sidebar-apps-count').textContent = adminApplications.length;
  document.getElementById('sidebar-inq-count').textContent = adminInquiries.length;

  document.getElementById('kpi-apps-count').textContent = adminApplications.length;
  document.getElementById('kpi-courses-count').textContent = adminCourses.length;
  document.getElementById('kpi-inq-count').textContent = adminInquiries.length;
  document.getElementById('kpi-ann-count').textContent = adminAnnouncements.length;
}

// Check Backend Connection Status
async function refreshBackendStatus() {
  const badge = document.getElementById('backend-status-badge');
  const text = document.getElementById('backend-status-text');
  const creds = window.ITTrackDB.getCredentials();

  if (!creds.isConfigured) {
    badge.className = 'backend-indicator local-mode';
    text.textContent = 'Demo Mode (Offline Fallback)';
    return;
  }

  text.textContent = 'Connecting to Supabase...';
  const testRes = await window.ITTrackDB.testConnection(creds.url, creds.anonKey);

  if (testRes.success) {
    badge.className = 'backend-indicator';
    text.textContent = testRes.schemaMissing ? 'Supabase (Tables Missing)' : 'Supabase Connected';
  } else {
    badge.className = 'backend-indicator local-mode';
    text.textContent = 'Supabase Offline (Demo Active)';
  }
}

// ==============================================================================
// 4. OVERVIEW TAB RENDERING
// ==============================================================================

function renderOverview() {
  const recentTable = document.getElementById('overview-recent-apps');
  if (!recentTable) return;

  const recent = adminApplications.slice(0, 5);

  if (recent.length === 0) {
    recentTable.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--admin-text-muted); padding: 2rem;">
          No student applications received yet.
        </td>
      </tr>
    `;
    return;
  }

  recentTable.innerHTML = recent.map(app => `
    <tr>
      <td>
        <strong style="color:#fff;">${escapeHtml(app.student_name)}</strong><br>
        <small style="color:var(--admin-text-muted);">${escapeHtml(app.student_email)}</small>
      </td>
      <td>${escapeHtml(app.course_title)}</td>
      <td><span style="font-size: 0.8rem; color: #93c5fd;">${escapeHtml(app.preferred_timing || 'Flexible')}</span></td>
      <td>
        <span class="status-badge badge-${app.status || 'pending'}">
          ${escapeHtml(app.status || 'pending')}
        </span>
      </td>
      <td>${formatDate(app.created_at)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewApplicationDetail('${app.id}')">
          View Profile
        </button>
      </td>
    </tr>
  `).join('');
}

// ==============================================================================
// 5. COURSES TAB (CRUD)
// ==============================================================================

function renderCoursesTable() {
  const tbody = document.getElementById('courses-table-body');
  if (!tbody) return;

  const search = (document.getElementById('course-search-input')?.value || '').toLowerCase();
  const filtered = adminCourses.filter(c => 
    c.title.toLowerCase().includes(search) || 
    c.category.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 2rem;">
          No courses match your query.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(course => `
    <tr>
      <td>
        <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(course.title)}</strong><br>
        <small style="color: var(--admin-text-dim);">Instructor: ${escapeHtml(course.instructor || 'Staff')}</small>
      </td>
      <td><span class="course-category" style="font-size: 0.72rem;">${escapeHtml(course.category)}</span></td>
      <td>${escapeHtml(course.duration || 'N/A')}</td>
      <td><strong style="color: #34d399;">$${Number(course.fee || 0).toLocaleString()}</strong></td>
      <td>${escapeHtml(course.level || 'All Levels')}</td>
      <td>${course.badge ? `<span class="course-badge">${escapeHtml(course.badge)}</span>` : '-'}</td>
      <td>
        <div class="action-btn-group">
          <button class="btn-icon" onclick="openEditCourseModal('${course.id}')" title="Edit Course">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
          <button class="btn-icon danger" onclick="handleDeleteCourse('${course.id}', '${escapeAttr(course.title)}')" title="Delete Course">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.filterCoursesTable = function() {
  renderCoursesTable();
};

window.openAddCourseModal = function() {
  document.getElementById('course-edit-form').reset();
  document.getElementById('edit_course_id').value = '';
  document.getElementById('course-modal-heading').textContent = 'Add New Course Track';
  document.getElementById('course-edit-modal').classList.add('active');
};

window.openEditCourseModal = function(courseId) {
  const course = adminCourses.find(c => c.id === courseId);
  if (!course) return;

  document.getElementById('course-modal-heading').textContent = 'Edit Course Track';
  document.getElementById('edit_course_id').value = course.id;
  document.getElementById('edit_title').value = course.title || '';
  document.getElementById('edit_category').value = course.category || 'Software Engineering';
  document.getElementById('edit_level').value = course.level || 'Beginner to Pro';
  document.getElementById('edit_duration').value = course.duration || '';
  document.getElementById('edit_fee').value = course.fee || 0;
  document.getElementById('edit_badge').value = course.badge || '';
  document.getElementById('edit_instructor').value = course.instructor || '';
  document.getElementById('edit_desc').value = course.description || '';

  const syllabusList = Array.isArray(course.syllabus) 
    ? course.syllabus 
    : (typeof course.syllabus === 'string' ? JSON.parse(course.syllabus || '[]') : []);
  document.getElementById('edit_syllabus').value = syllabusList.join('\n');

  document.getElementById('course-edit-modal').classList.add('active');
};

window.closeCourseEditModal = function() {
  document.getElementById('course-edit-modal').classList.remove('active');
};

window.handleSaveCourse = async function(e) {
  e.preventDefault();
  const id = document.getElementById('edit_course_id').value;
  const saveBtn = document.getElementById('save-course-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving Course...';

  const syllabusLines = document.getElementById('edit_syllabus').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const courseData = {
    title: document.getElementById('edit_title').value.trim(),
    category: document.getElementById('edit_category').value,
    level: document.getElementById('edit_level').value,
    duration: document.getElementById('edit_duration').value.trim(),
    fee: parseFloat(document.getElementById('edit_fee').value) || 0,
    badge: document.getElementById('edit_badge').value.trim(),
    instructor: document.getElementById('edit_instructor').value.trim(),
    description: document.getElementById('edit_desc').value.trim(),
    syllabus: syllabusLines,
    is_active: true
  };

  try {
    let res;
    if (id) {
      res = await window.ITTrackDB.updateCourse(id, courseData);
    } else {
      res = await window.ITTrackDB.addCourse(courseData);
    }

    if (res.success) {
      showAdminToast('Course Saved', `Successfully updated "${courseData.title}" in database.`, 'success');
      closeCourseEditModal();
      await reloadAllData();
    } else {
      showAdminToast('Error Saving', res.message || 'Could not save course.', 'error');
    }
  } catch (err) {
    console.error('Save course error:', err);
    showAdminToast('Error', 'An error occurred while saving the course.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Course to Database';
  }
};

window.handleDeleteCourse = async function(id, title) {
  if (!confirm(`Are you sure you want to delete the course "${title}"?`)) return;

  try {
    const res = await window.ITTrackDB.deleteCourse(id);
    if (res.success) {
      showAdminToast('Course Deleted', `Deleted "${title}".`, 'info');
      await reloadAllData();
    } else {
      showAdminToast('Error', res.message || 'Could not delete course.', 'error');
    }
  } catch (err) {
    console.error('Delete course error:', err);
    showAdminToast('Error', 'Could not delete course.', 'error');
  }
};

// ==============================================================================
// 6. APPLICATIONS TAB
// ==============================================================================

function renderApplicationsTable() {
  const tbody = document.getElementById('applications-table-body');
  if (!tbody) return;

  const filter = document.getElementById('apps-status-filter')?.value || 'all';
  const filtered = filter === 'all' 
    ? adminApplications 
    : adminApplications.filter(a => (a.status || 'pending') === filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--admin-text-muted); padding: 2.5rem;">
          No applications found for status "${filter}".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(app => `
    <tr>
      <td>
        <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(app.student_name)}</strong>
      </td>
      <td>
        <div style="font-size: 0.85rem; color: #93c5fd;">${escapeHtml(app.student_email)}</div>
        <div style="font-size: 0.8rem; color: var(--admin-text-dim);">${escapeHtml(app.student_phone)}</div>
      </td>
      <td>
        <span style="font-weight: 600; color: #f8fafc;">${escapeHtml(app.course_title)}</span>
      </td>
      <td>
        <span style="font-size: 0.8rem; color: var(--admin-text-muted);">${escapeHtml(app.experience_level || 'Beginner')}</span>
      </td>
      <td>
        <span style="font-size: 0.8rem; color: #c084fc;">${escapeHtml(app.preferred_timing || 'Flexible')}</span>
      </td>
      <td>
        <span class="status-badge badge-${app.status || 'pending'}">
          ${escapeHtml(app.status || 'pending')}
        </span>
      </td>
      <td>
        <select class="form-select" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; width: auto;" onchange="handleAppStatusChange('${app.id}', this.value)">
          <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="under_review" ${app.status === 'under_review' ? 'selected' : ''}>Under Review</option>
          <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
          <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewApplicationDetail('${app.id}')">
          Details
        </button>
      </td>
    </tr>
  `).join('');
}

window.filterApplicationsTable = function() {
  renderApplicationsTable();
};

window.handleAppStatusChange = async function(id, newStatus) {
  try {
    const res = await window.ITTrackDB.updateApplicationStatus(id, newStatus);
    if (res.success) {
      showAdminToast('Status Updated', `Application status changed to ${newStatus.replace('_', ' ')}.`, 'success');
      await reloadAllData();
    } else {
      showAdminToast('Error', res.message || 'Could not update status.', 'error');
    }
  } catch (err) {
    console.error('Status update error:', err);
    showAdminToast('Error', 'Failed to update application status.', 'error');
  }
};

window.viewApplicationDetail = function(appId) {
  const app = adminApplications.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('modal-app-id').textContent = `Application ID: ${app.id}`;
  const body = document.getElementById('modal-app-body');

  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(255, 255, 255, 0.03); padding: 1.25rem; border-radius: 10px;">
      <div>
        <label style="font-size: 0.75rem; color: var(--admin-text-dim); text-transform: uppercase;">Full Name</label>
        <div style="font-weight: 700; color: #fff;">${escapeHtml(app.student_name)}</div>
      </div>
      <div>
        <label style="font-size: 0.75rem; color: var(--admin-text-dim); text-transform: uppercase;">Program</label>
        <div style="font-weight: 700; color: var(--admin-primary);">${escapeHtml(app.course_title)}</div>
      </div>
      <div>
        <label style="font-size: 0.75rem; color: var(--admin-text-dim); text-transform: uppercase;">Email</label>
        <div><a href="mailto:${escapeAttr(app.student_email)}" style="color: #93c5fd;">${escapeHtml(app.student_email)}</a></div>
      </div>
      <div>
        <label style="font-size: 0.75rem; color: var(--admin-text-dim); text-transform: uppercase;">Phone</label>
        <div>${escapeHtml(app.student_phone)}</div>
      </div>
      <div>
        <label style="font-size: 0.75rem; color: var(--admin-text-dim); text-transform: uppercase;">Schedule Preference</label>
        <div>${escapeHtml(app.preferred_timing || 'Flexible')}</div>
      </div>
      <div>
        <label style="font-size: 0.75rem; color: var(--admin-text-dim); text-transform: uppercase;">Experience Level</label>
        <div>${escapeHtml(app.experience_level || 'Beginner')}</div>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <label class="form-label">Motivation & Goals Statement</label>
      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--admin-border); border-radius: 8px; padding: 1rem; font-size: 0.9rem; color: #f1f5f9; min-height: 80px;">
        ${escapeHtml(app.statement || 'No statement provided by applicant.')}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="detail_admin_notes">Internal Admissions Notes</label>
      <textarea id="detail_admin_notes" class="form-textarea" placeholder="Add confidential notes, interview observations, scholarship grant details...">${escapeHtml(app.admin_notes || '')}</textarea>
    </div>

    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button class="btn btn-outline" onclick="closeAppDetailModal()">Close</button>
      <button class="btn btn-primary" onclick="saveAppNotes('${app.id}')">Save Notes</button>
    </div>
  `;

  document.getElementById('app-detail-modal').classList.add('active');
};

window.saveAppNotes = async function(appId) {
  const app = adminApplications.find(a => a.id === appId);
  if (!app) return;

  const notes = document.getElementById('detail_admin_notes').value;
  try {
    const res = await window.ITTrackDB.updateApplicationStatus(appId, app.status || 'pending', notes);
    if (res.success) {
      showAdminToast('Notes Saved', 'Internal notes updated successfully.', 'success');
      closeAppDetailModal();
      await reloadAllData();
    } else {
      showAdminToast('Error', res.message || 'Could not save notes.', 'error');
    }
  } catch (err) {
    console.error('Error saving notes:', err);
    showAdminToast('Error', 'Failed to save notes.', 'error');
  }
};

window.closeAppDetailModal = function() {
  document.getElementById('app-detail-modal').classList.remove('active');
};

// ==============================================================================
// 7. INQUIRIES TAB
// ==============================================================================

function renderInquiriesTable() {
  const tbody = document.getElementById('inquiries-table-body');
  if (!tbody) return;

  const filter = document.getElementById('inquiries-status-filter')?.value || 'all';
  const filtered = filter === 'all' 
    ? adminInquiries 
    : adminInquiries.filter(i => (i.status || 'new') === filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--admin-text-muted); padding: 2.5rem;">
          No inquiries found for filter "${filter}".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(inq => `
    <tr>
      <td><strong style="color: #fff;">${escapeHtml(inq.full_name)}</strong></td>
      <td>
        <div style="color: #93c5fd; font-size: 0.85rem;">${escapeHtml(inq.email)}</div>
        <div style="color: var(--admin-text-dim); font-size: 0.8rem;">${escapeHtml(inq.phone || '-')}</div>
      </td>
      <td><strong>${escapeHtml(inq.subject)}</strong></td>
      <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--admin-text-muted);">
        ${escapeHtml(inq.message)}
      </td>
      <td>${formatDate(inq.created_at)}</td>
      <td>
        <span class="status-badge badge-${inq.status || 'new'}">
          ${escapeHtml(inq.status || 'new')}
        </span>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="toggleInquiryStatus('${inq.id}', '${inq.status === 'responded' ? 'new' : 'responded'}')">
          ${inq.status === 'responded' ? 'Mark New' : 'Mark Responded'}
        </button>
      </td>
    </tr>
  `).join('');
}

window.filterInquiriesTable = function() {
  renderInquiriesTable();
};

window.toggleInquiryStatus = async function(id, newStatus) {
  try {
    const res = await window.ITTrackDB.updateInquiryStatus(id, newStatus);
    if (res.success) {
      showAdminToast('Inquiry Updated', `Status changed to ${newStatus}.`, 'success');
      await reloadAllData();
    }
  } catch (err) {
    console.error('Inquiry update error:', err);
    showAdminToast('Error', 'Could not update inquiry.', 'error');
  }
};

// ==============================================================================
// 8. ANNOUNCEMENTS TAB
// ==============================================================================

function renderAnnouncementsTable() {
  const tbody = document.getElementById('announcements-table-body');
  if (!tbody) return;

  if (adminAnnouncements.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--admin-text-muted); padding: 2.5rem;">
          No announcements published yet.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminAnnouncements.map(ann => `
    <tr>
      <td><strong style="color:#fff;">${escapeHtml(ann.title)}</strong></td>
      <td><span class="course-category" style="font-size: 0.72rem;">${escapeHtml(ann.category || 'General')}</span></td>
      <td style="max-width: 320px; color: var(--admin-text-muted); font-size: 0.88rem;">${escapeHtml(ann.content)}</td>
      <td><code>${escapeHtml(ann.link_url || '-')}</code></td>
      <td>#${ann.priority || 1}</td>
      <td>
        <button class="btn-icon danger" onclick="handleDeleteAnnouncement('${ann.id}', '${escapeAttr(ann.title)}')" title="Delete Announcement">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

window.openAddAnnouncementModal = function() {
  document.getElementById('announcement-form').reset();
  document.getElementById('announcement-modal').classList.add('active');
};

window.closeAnnouncementModal = function() {
  document.getElementById('announcement-modal').classList.remove('active');
};

window.handleSaveAnnouncement = async function(e) {
  e.preventDefault();
  const annData = {
    title: document.getElementById('ann_title').value.trim(),
    category: document.getElementById('ann_category').value,
    link_url: document.getElementById('ann_link').value.trim() || '#courses',
    content: document.getElementById('ann_content').value.trim(),
    priority: 1
  };

  try {
    const res = await window.ITTrackDB.addAnnouncement(annData);
    if (res.success) {
      showAdminToast('Notice Published', `"${annData.title}" is now active.`, 'success');
      closeAnnouncementModal();
      await reloadAllData();
    } else {
      showAdminToast('Error', res.message || 'Could not publish notice.', 'error');
    }
  } catch (err) {
    console.error('Save announcement error:', err);
    showAdminToast('Error', 'An error occurred while publishing notice.', 'error');
  }
};

window.handleDeleteAnnouncement = async function(id, title) {
  if (!confirm(`Delete announcement "${title}"?`)) return;

  try {
    const res = await window.ITTrackDB.deleteAnnouncement(id);
    if (res.success) {
      showAdminToast('Notice Deleted', 'Announcement removed from notice board.', 'info');
      await reloadAllData();
    }
  } catch (err) {
    console.error('Delete announcement error:', err);
    showAdminToast('Error', 'Failed to delete announcement.', 'error');
  }
};

// ==============================================================================
// 9. SUPABASE SETTINGS & CREDENTIALS
// ==============================================================================

function populateSettingsInputs() {
  const creds = window.ITTrackDB.getCredentials();
  const urlInput = document.getElementById('cfg_url');
  const keyInput = document.getElementById('cfg_key');

  if (urlInput && !urlInput.value) urlInput.value = creds.url;
  if (keyInput && !keyInput.value) keyInput.value = creds.anonKey;
}

window.handleSaveSupabaseConfig = async function(e) {
  e.preventDefault();
  const url = document.getElementById('cfg_url').value.trim();
  const key = document.getElementById('cfg_key').value.trim();

  window.ITTrackDB.saveCredentials(url, key);
  showAdminToast('Settings Saved', 'Connecting to updated Supabase project...', 'info');

  await refreshBackendStatus();
  await reloadAllData();
  testCurrentConnection();
};

window.testCurrentConnection = async function() {
  const url = document.getElementById('cfg_url').value.trim();
  const key = document.getElementById('cfg_key').value.trim();

  showAdminToast('Testing Supabase...', 'Sending ping query to database...', 'info');
  const res = await window.ITTrackDB.testConnection(url, key);

  if (res.success) {
    if (res.schemaMissing) {
      showAdminToast('Connected (Setup Needed)', res.message, 'info');
    } else {
      showAdminToast('Connection Verified!', res.message, 'success');
    }
  } else {
    showAdminToast('Connection Failed', res.message, 'error');
  }
  await refreshBackendStatus();
};

window.resetToDemoMode = function() {
  if (confirm('Reset credentials back to offline demo mode?')) {
    window.ITTrackDB.saveCredentials('', '');
    document.getElementById('cfg_url').value = '';
    document.getElementById('cfg_key').value = '';
    showAdminToast('Demo Mode Restored', 'The app will now use the local storage fallback store.', 'info');
    refreshBackendStatus();
    reloadAllData();
  }
};

window.copySqlSchema = function() {
  const instructions = `-- 1. Open your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your Project -> Click "SQL Editor"
-- 3. Click "New query" -> Paste all content from 'supabase-schema.sql' -> Click "Run"`;

  navigator.clipboard.writeText(instructions).then(() => {
    showAdminToast('Instructions Copied!', 'Open Supabase SQL Editor and run supabase-schema.sql.', 'success');
  }).catch(() => {
    showAdminToast('Notice', 'Please open supabase-schema.sql in your editor.', 'info');
  });
};

// ==============================================================================
// 10. ADMIN TOASTS & UTILITIES
// ==============================================================================

function showAdminToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-desc">${escapeHtml(message)}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer; font-size:1.1rem; opacity:0.7;">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
