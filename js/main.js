/**
 * IT TRACK INSTITUTE - PUBLIC SITE LOGIC
 * Manages dynamic course catalog, filtering, modals,
 * and Supabase-backed submissions for applications & inquiries.
 */

let allCourses = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  setupMobileNav();
  setupFilterTabs();
  await loadAnnouncements();
  await loadCourses();
});

// 1. Mobile Navigation
function setupMobileNav() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close when clicking nav link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

// 2. Fetch & Render Announcements
async function loadAnnouncements() {
  try {
    const { data } = await window.ITTrackDB.getAnnouncements();
    if (data && data.length > 0) {
      const activeAnn = data[0];
      const textEl = document.getElementById('announcement-text');
      const linkEl = document.getElementById('announcement-link');

      if (textEl) textEl.textContent = `${activeAnn.title} — ${activeAnn.content}`;
      if (linkEl && activeAnn.link_url) {
        linkEl.setAttribute('href', activeAnn.link_url);
      }
    }
  } catch (err) {
    console.error('Error loading announcements:', err);
  }
}

// 3. Fetch & Render Courses
async function loadCourses() {
  const container = document.getElementById('courses-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
      Loading cutting-edge tech tracks...
    </div>
  `;

  try {
    const res = await window.ITTrackDB.getCourses();
    allCourses = res.data || [];
    renderCourses();
    populateCourseSelect();
  } catch (err) {
    console.error('Error loading courses:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #ef4444;">
        Failed to load courses. Please refresh or check connection.
      </div>
    `;
  }
}

// Render filtered courses
function renderCourses() {
  const container = document.getElementById('courses-container');
  if (!container) return;

  const filtered = currentCategory === 'all' 
    ? allCourses.filter(c => c.is_active !== false)
    : allCourses.filter(c => c.is_active !== false && c.category === currentCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
        No tracks found for "${currentCategory}". Check back soon!
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(course => {
    const syllabusList = Array.isArray(course.syllabus) 
      ? course.syllabus 
      : (typeof course.syllabus === 'string' ? JSON.parse(course.syllabus || '[]') : []);

    const highlightTopic = syllabusList[0] || 'Hands-on enterprise project';

    return `
      <div class="course-card">
        <div>
          <div class="course-meta">
            <span class="course-category">${escapeHtml(course.category || 'Technology')}</span>
            ${course.badge ? `<span class="course-badge">${escapeHtml(course.badge)}</span>` : ''}
          </div>
          
          <h3 class="course-title">${escapeHtml(course.title)}</h3>
          <p class="course-desc">${escapeHtml(course.description)}</p>

          <div class="course-details-list">
            <div class="course-detail-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${escapeHtml(course.duration || '16 Weeks')}</span>
            </div>
            <div class="course-detail-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>${escapeHtml(course.level || 'All Levels')}</span>
            </div>
          </div>
        </div>

        <div class="course-footer">
          <div class="course-price-wrap">
            <span class="price-label">Tuition</span>
            <span class="price-val">$${Number(course.fee || 0).toLocaleString()}</span>
          </div>

          <div class="course-actions">
            <button class="btn btn-outline btn-sm" onclick="openCourseModal('${course.id}')">
              Syllabus
            </button>
            <button class="btn btn-primary btn-sm" onclick="applyForCourse('${course.id}', '${escapeAttr(course.title)}')">
              Apply
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Setup Filter Tabs
function setupFilterTabs() {
  const tabsContainer = document.getElementById('filter-tabs');
  if (!tabsContainer) return;

  tabsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      tabsContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      renderCourses();
    }
  });
}

// Populate Course Selection in Application Modal
function populateCourseSelect(preselectCourseId = '') {
  const select = document.getElementById('app_course');
  if (!select) return;

  select.innerHTML = allCourses
    .filter(c => c.is_active !== false)
    .map(c => `
      <option value="${c.id}" ${c.id === preselectCourseId ? 'selected' : ''}>
        ${escapeHtml(c.title)} ($${Number(c.fee || 0).toLocaleString()})
      </option>
    `).join('');
}

// 5. Course Details Modal
window.openCourseModal = function(courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;

  document.getElementById('modal-course-category').textContent = course.category || 'Technology';
  document.getElementById('modal-course-title').textContent = course.title;
  document.getElementById('modal-course-desc').textContent = course.description;
  document.getElementById('modal-course-duration').textContent = course.duration || '16 Weeks';
  document.getElementById('modal-course-level').textContent = course.level || 'Beginner to Advanced';
  document.getElementById('modal-course-fee').textContent = `$${Number(course.fee || 0).toLocaleString()}`;
  document.getElementById('modal-course-instructor').textContent = course.instructor || 'Senior Tech Lead';

  const syllabusList = Array.isArray(course.syllabus) 
    ? course.syllabus 
    : (typeof course.syllabus === 'string' ? JSON.parse(course.syllabus || '[]') : []);

  const listContainer = document.getElementById('modal-syllabus-list');
  listContainer.innerHTML = syllabusList.map(item => `
    <li class="syllabus-item">${escapeHtml(item)}</li>
  `).join('') || '<li class="syllabus-item">Comprehensive industry curriculum and portfolio defense.</li>';

  const applyBtn = document.getElementById('modal-apply-btn');
  applyBtn.onclick = () => {
    closeCourseModal();
    applyForCourse(course.id, course.title);
  };

  document.getElementById('course-modal').classList.add('active');
};

window.closeCourseModal = function() {
  document.getElementById('course-modal').classList.remove('active');
};

// 6. Application Modal Handling
window.openApplyModal = function() {
  populateCourseSelect();
  document.getElementById('apply-modal').classList.add('active');
};

window.closeApplyModal = function() {
  document.getElementById('apply-modal').classList.remove('active');
};

window.applyForCourse = function(courseId, courseTitle) {
  populateCourseSelect(courseId);
  document.getElementById('apply-modal').classList.add('active');
};

// Submit Application to Supabase
window.handleApplicationSubmit = async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('app-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting Application...';

  const courseSelect = document.getElementById('app_course');
  const selectedCourseId = courseSelect.value;
  const selectedCourseText = courseSelect.options[courseSelect.selectedIndex]?.text || '';
  const courseTitle = selectedCourseText.split(' ($')[0];

  const payload = {
    course_id: selectedCourseId,
    course_title: courseTitle,
    student_name: document.getElementById('app_name').value.trim(),
    student_email: document.getElementById('app_email').value.trim(),
    student_phone: document.getElementById('app_phone').value.trim(),
    preferred_timing: document.getElementById('app_timing').value,
    experience_level: document.getElementById('app_experience').value,
    statement: document.getElementById('app_statement').value.trim(),
  };

  try {
    const res = await window.ITTrackDB.submitApplication(payload);
    if (res.success) {
      if (res.source === 'supabase') {
        showToast('Application Received in Supabase!', `Thank you, ${payload.student_name}. Your record is now stored in Supabase!`, 'success');
      } else {
        showToast('Application Saved (Demo Mode)', `Notice: Supabase URL and Anon Key are not connected yet. Saved to browser demo store.`, 'info');
      }
      document.getElementById('application-form').reset();
      closeApplyModal();
    } else {
      showToast('Supabase Error', res.message || 'Could not save to Supabase. Check console for details.', 'error');
    }
  } catch (err) {
    console.error('Application submit error:', err);
    showToast('Error', err.message || 'An unexpected error occurred.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Application';
  }
};

// 7. Submit Inquiry to Supabase
window.handleInquirySubmit = async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('inq-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending Message...';

  const payload = {
    full_name: document.getElementById('inq_name').value.trim(),
    email: document.getElementById('inq_email').value.trim(),
    phone: document.getElementById('inq_phone').value.trim(),
    subject: document.getElementById('inq_subject').value,
    message: document.getElementById('inq_message').value.trim()
  };

  try {
    const res = await window.ITTrackDB.submitInquiry(payload);
    if (res.success) {
      if (res.source === 'supabase') {
        showToast('Inquiry Stored in Supabase!', 'Our academic advisors have received your inquiry in Supabase.', 'success');
      } else {
        showToast('Message Sent (Demo Mode)', 'Supabase credentials not configured; saved to local browser demo store.', 'info');
      }
      document.getElementById('inquiry-form').reset();
    } else {
      showToast('Supabase Error', res.message || 'Could not send inquiry. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Inquiry submit error:', err);
    showToast('Error', err.message || 'An error occurred while sending your message.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Inquiry to Admissions';
  }
};

// 8. Toast Notification Utility
function showToast(title, message, type = 'info') {
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
  }, 5000);
}

// Escaping Helpers
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
