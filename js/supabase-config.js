/**
 * IT TRACK INSTITUTE - SUPABASE CLIENT & DATA LAYER
 * 
 * Provides unified data access to Supabase with automatic localStorage
 * fallback and seed data so the site works immediately out-of-the-box,
 * and seamlessly switches to live Supabase once credentials are provided.
 */

// Default configuration placeholders (replace with your project credentials if desired)
const DEFAULT_SUPABASE_CONFIG = {
  url: '', // e.g. 'https://xyzcompany.supabase.co'
  anonKey: '' // e.g. 'eyJhbGciOiJIUzI1NiIsIn...'
};

// LocalStorage Keys for custom runtime setup from the Admin panel
const STORAGE_KEYS = {
  URL: 'it_track_supabase_url',
  ANON_KEY: 'it_track_supabase_anon_key',
  MOCK_COURSES: 'it_track_mock_courses',
  MOCK_APPLICATIONS: 'it_track_mock_applications',
  MOCK_INQUIRIES: 'it_track_mock_inquiries',
  MOCK_ANNOUNCEMENTS: 'it_track_mock_announcements',
  ADMIN_AUTH: 'it_track_admin_logged_in'
};

// Initial Seed Data for Demo & Offline Fallback
const SEED_DATA = {
  courses: [
    {
      id: 'c111-web-dev',
      title: 'Full Stack Web Development & Cloud',
      slug: 'full-stack-web-dev',
      category: 'Software Engineering',
      level: 'Beginner to Pro',
      duration: '24 Weeks',
      fee: 1200,
      badge: 'Bestseller',
      instructor: 'Alex Vance (Senior Full Stack Architect)',
      is_featured: true,
      is_active: true,
      description: 'Master modern web technologies from HTML5/CSS3 and TypeScript to React, Node.js, Express, PostgreSQL, and AWS cloud deployment with CI/CD.',
      syllabus: [
        'Modern Frontend: Semantic HTML5, CSS Grid/Flexbox, ES6+ JavaScript, React.js',
        'Backend API Mastery: Node.js, Express REST APIs, Authentication & JWT',
        'Database Engineering: PostgreSQL, Supabase, Redis Caching, Prisma ORM',
        'DevOps & Cloud: Docker Containers, GitHub Actions CI/CD, AWS Deployment',
        'Capstone Projects: Full-Scale SaaS Application & Portfolio Defense'
      ]
    },
    {
      id: 'c222-cyber-sec',
      title: 'Cybersecurity & Ethical Hacking Defense',
      slug: 'cybersecurity-ethical-hacking',
      category: 'Cyber Security',
      level: 'Intermediate',
      duration: '20 Weeks',
      fee: 1450,
      badge: 'High Demand',
      instructor: 'Marcus Reed (Offensive Security Certified)',
      is_featured: true,
      is_active: true,
      description: 'Comprehensive hands-on training covering penetration testing, network defense, threat intelligence, incident response, and preparation for CompTIA Security+ and CEH.',
      syllabus: [
        'Networking Fundamentals, TCP/IP Suite & Linux Administration',
        'Vulnerability Assessment, Nmap Scanning & Threat Modeling',
        'Web Application Security (OWASP Top 10, Burp Suite & SQLi)',
        'SOC Operations, SIEM Monitoring, Incident Response & Digital Forensics',
        'Ethical Hacking Labs & CompTIA Security+ Exam Prep'
      ]
    },
    {
      id: 'c333-cloud-devops',
      title: 'Cloud Architecture & DevOps Engineering',
      slug: 'cloud-architecture-devops',
      category: 'Cloud & DevOps',
      level: 'Intermediate to Advanced',
      duration: '18 Weeks',
      fee: 1350,
      badge: 'Certification',
      instructor: 'Elena Rostova (Principal Cloud Engineer)',
      is_featured: true,
      is_active: true,
      description: 'Transform into a Cloud DevOps specialist. Master AWS, Terraform, Docker, Kubernetes orchestration, GitOps workflows, and enterprise automation.',
      syllabus: [
        'Cloud Infrastructure on AWS (VPC, IAM, EC2, S3, RDS)',
        'Infrastructure as Code (IaC) with Terraform & CloudFormation',
        'Microservices & Containerization with Docker',
        'Kubernetes Container Orchestration, Helm Charts & EKS',
        'CI/CD Automation Pipelines with GitHub Actions & ArgoCD'
      ]
    },
    {
      id: 'c444-ai-ml',
      title: 'Applied AI, Machine Learning & Data Science',
      slug: 'applied-ai-machine-learning',
      category: 'AI & Data Science',
      level: 'Beginner to Intermediate',
      duration: '22 Weeks',
      fee: 1500,
      badge: 'Featured',
      instructor: 'Dr. Aris Thorne (AI Research Lead)',
      is_featured: true,
      is_active: true,
      description: 'Harness the power of Python, NumPy, Pandas, Scikit-Learn, Deep Learning with PyTorch, and generative AI LLM application engineering.',
      syllabus: [
        'Python for Data Science, Vectorized Math & Data Wrangling',
        'Statistical Modeling, Regression, Classification & Clustering',
        'Deep Learning Foundations, Neural Networks & PyTorch',
        'Generative AI: Prompt Engineering, Embeddings, RAG & LLM Apps',
        'Model Deployment via FastAPI & Production AI pipelines'
      ]
    },
    {
      id: 'c555-networking',
      title: 'Enterprise Network Engineering & Cisco CCNA',
      slug: 'enterprise-network-engineering',
      category: 'Networking',
      level: 'Beginner to Intermediate',
      duration: '16 Weeks',
      fee: 950,
      badge: 'Popular',
      instructor: 'David Chen (CCIE Certified Instructor)',
      is_featured: false,
      is_active: true,
      description: 'Hands-on network design, routing, switching, wireless configuration, network security protocols, and comprehensive preparation for Cisco CCNA certification.',
      syllabus: [
        'OSI Model, IP Addressing & CIDR Subnetting Mastery',
        'Cisco Router & Switch Configuration (VLANs, Inter-VLAN Routing, STP)',
        'Dynamic Routing Protocols (OSPFv2/v3, BGP Overview)',
        'Network Security, Firewalls, Access Control Lists (ACLs) & VPNs',
        'Packet Tracer Simulation & CCNA Comprehensive Exam Drills'
      ]
    },
    {
      id: 'c666-ui-ux',
      title: 'Product Design: UI/UX & Design Systems',
      slug: 'product-design-ui-ux',
      category: 'UI/UX Design',
      level: 'All Levels',
      duration: '14 Weeks',
      fee: 890,
      badge: 'Trending',
      instructor: 'Sophie Lin (Lead Product Designer)',
      is_featured: false,
      is_active: true,
      description: 'Craft user-centric digital experiences. Learn wireframing, interactive prototyping in Figma, user research, accessibility standards, and building scalable design systems.',
      syllabus: [
        'Design Thinking, User Research Methodologies & Empathy Maps',
        'Information Architecture, User Flows & Wireframing',
        'Advanced Figma: Auto-Layout 5.0, Components, Variants & Variables',
        'Atomic Design Systems, WCAG 2.1 Accessibility & Typography',
        'Interactive Prototyping, Usability Testing & Developer Handoff'
      ]
    }
  ],
  applications: [
    {
      id: 'app-001',
      course_id: 'c111-web-dev',
      course_title: 'Full Stack Web Development & Cloud',
      student_name: 'Sarah Jenkins',
      student_email: 'sarah.j@example.com',
      student_phone: '+1 (555) 234-8901',
      experience_level: 'Some Coding / IT Background',
      preferred_timing: 'Weekday Evening',
      statement: 'Looking to transition from QA engineering into full stack software development.',
      status: 'pending',
      admin_notes: '',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'app-002',
      course_id: 'c222-cyber-sec',
      course_title: 'Cybersecurity & Ethical Hacking Defense',
      student_name: 'Michael Torres',
      student_email: 'm.torres@example.com',
      student_phone: '+1 (555) 876-5432',
      experience_level: 'Working Professional',
      preferred_timing: 'Weekend Intensive',
      statement: 'System administrator looking to specialize in offensive security and threat hunting.',
      status: 'under_review',
      admin_notes: 'Scheduled for technical assessment next Tuesday.',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'app-003',
      course_id: 'c444-ai-ml',
      course_title: 'Applied AI, Machine Learning & Data Science',
      student_name: 'Amina Khan',
      student_email: 'amina.khan@example.com',
      student_phone: '+1 (555) 432-1098',
      experience_level: 'Complete Beginner',
      preferred_timing: 'Weekday Morning',
      statement: 'Graduated in mathematics; enthusiastic about applying statistical modeling to AI.',
      status: 'accepted',
      admin_notes: 'Scholarship approved (15% grant).',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString()
    }
  ],
  inquiries: [
    {
      id: 'inq-001',
      full_name: 'Daniel Brooks',
      email: 'dbrooks@enterprise.org',
      phone: '+1 (555) 345-6789',
      subject: 'Corporate Cohort Training Inquiry',
      message: 'We are looking to upskill a team of 15 engineers in Cloud DevOps and Kubernetes. Do you offer custom corporate schedules?',
      status: 'new',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'inq-002',
      full_name: 'Jessica Parker',
      email: 'jparker@techmail.com',
      phone: '+1 (555) 678-9012',
      subject: 'Installment Payment Plans',
      message: 'Hi! I would like to know if the Full Stack Web Development course has monthly installment payment plans available for students.',
      status: 'responded',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ],
  announcements: [
    {
      id: 'ann-001',
      title: 'Fall 2026 Batch Admissions Open',
      content: 'Early-bird applications are now open with a 20% scholarship on all flagship engineering diplomas until end of month.',
      category: 'Admissions',
      link_url: '#courses',
      is_active: true,
      priority: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'ann-002',
      title: 'Weekend Masterclass: Building Autonomous AI Agents',
      content: 'Join our free interactive weekend workshop with top Silicon Valley engineers on LangChain and agent architectures.',
      category: 'Workshop',
      link_url: '#apply',
      is_active: true,
      priority: 2,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'ann-003',
      title: 'Annual Tech Career Fair & Hiring Partner Expo',
      content: 'Over 40 tech hiring partners will conduct on-campus hiring drives exclusively for IT Track Institute enrolled students and alumni.',
      category: 'Event',
      link_url: '#about',
      is_active: true,
      priority: 3,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString()
    }
  ]
};

// Initialize Mock Store in localStorage if empty
function initializeMockStore() {
  if (!localStorage.getItem(STORAGE_KEYS.MOCK_COURSES)) {
    localStorage.setItem(STORAGE_KEYS.MOCK_COURSES, JSON.stringify(SEED_DATA.courses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOCK_APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.MOCK_APPLICATIONS, JSON.stringify(SEED_DATA.applications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOCK_INQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.MOCK_INQUIRIES, JSON.stringify(SEED_DATA.inquiries));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS, JSON.stringify(SEED_DATA.announcements));
  }
}
initializeMockStore();

// Retrieve Active Supabase Credentials
function getSupabaseCredentials() {
  const customUrl = localStorage.getItem(STORAGE_KEYS.URL);
  const customKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);

  const url = customUrl || DEFAULT_SUPABASE_CONFIG.url;
  const anonKey = customKey || DEFAULT_SUPABASE_CONFIG.anonKey;

  const isConfigured = Boolean(
    url && 
    url.trim().length > 0 && 
    url.startsWith('http') && 
    anonKey && 
    anonKey.trim().length > 10
  );

  return { url: url ? url.trim() : '', anonKey: anonKey ? anonKey.trim() : '', isConfigured };
}

// Get or Instantiate Supabase Client
let _supabaseClient = null;

function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!_supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      _supabaseClient = window.supabase.createClient(url, anonKey);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return _supabaseClient;
}

// Save Credentials to localStorage
function saveSupabaseCredentials(url, anonKey) {
  if (url) localStorage.setItem(STORAGE_KEYS.URL, url.trim());
  else localStorage.removeItem(STORAGE_KEYS.URL);

  if (anonKey) localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEYS.ANON_KEY);

  _supabaseClient = null; // reset client instance
}

// Test Connection against Supabase
async function testSupabaseConnection(testUrl, testKey) {
  const url = testUrl || getSupabaseCredentials().url;
  const key = testKey || getSupabaseCredentials().anonKey;

  if (!url || !key) {
    return { success: false, message: 'URL and Anon Key must not be empty.' };
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    return { success: false, message: 'Supabase JS library not loaded in browser window.' };
  }

  try {
    const client = window.supabase.createClient(url, key);
    // Simple query to verify connection
    const { data, error } = await client.from('courses').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, it's connected to Supabase but schema is missing
      if (error.code === '42P01') {
        return { 
          success: true, 
          schemaMissing: true,
          message: 'Connected to Supabase! However, the tables are not yet created. Please run supabase-schema.sql in the SQL Editor.' 
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
}

function isValidUUID(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

// ==============================================================================
// UNIFIED DATA ACCESS API (SUPABASE WITH FALLBACK STORE)
// ==============================================================================

window.ITTrackDB = {
  getCredentials: getSupabaseCredentials,
  saveCredentials: saveSupabaseCredentials,
  testConnection: testSupabaseConnection,

  // --- COURSES ---
  async getCourses() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return { data, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }
    // Fallback
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_COURSES) || '[]');
    return { data: local, source: 'local' };
  },

  async addCourse(course) {
    const client = getSupabaseClient();

    if (client) {
      try {
        const payload = {
          title: course.title,
          slug: course.slug || course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: course.category || 'General',
          level: course.level || 'Beginner to Advanced',
          duration: course.duration || '16 Weeks',
          fee: parseFloat(course.fee) || 0,
          description: course.description || '',
          syllabus: Array.isArray(course.syllabus) ? course.syllabus : [],
          instructor: course.instructor || 'Senior Industry Expert',
          badge: course.badge || '',
          is_featured: Boolean(course.is_featured),
          is_active: course.is_active !== undefined ? course.is_active : true
        };
        if (course.id && isValidUUID(course.id)) {
          payload.id = course.id;
        }

        const { data, error } = await client.from('courses').insert([payload]).select();
        if (error) {
          console.error('Supabase insert course error:', error);
          return { success: false, message: 'Supabase Error: ' + error.message };
        }
        if (data && data.length > 0) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.error('Supabase insert course exception:', err);
        return { success: false, message: err.message };
      }
    }

    // Local fallback
    const newCourse = {
      ...course,
      id: course.id || 'c_' + Date.now(),
      slug: course.slug || course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_active: course.is_active !== undefined ? course.is_active : true,
      created_at: new Date().toISOString()
    };
    const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_COURSES) || '[]');
    courses.unshift(newCourse);
    localStorage.setItem(STORAGE_KEYS.MOCK_COURSES, JSON.stringify(courses));
    return { success: true, data: newCourse, source: 'local' };
  },

  async updateCourse(id, updates) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('courses').update(updates).eq('id', id).select();
        if (!error && data) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase update course failed:', err);
      }
    }

    // Local fallback
    const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_COURSES) || '[]');
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.MOCK_COURSES, JSON.stringify(courses));
      return { success: true, data: courses[index], source: 'local' };
    }
    return { success: false, message: 'Course not found' };
  },

  async deleteCourse(id) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('courses').delete().eq('id', id);
        if (!error) {
          return { success: true, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase delete course failed:', err);
      }
    }

    // Local fallback
    let courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_COURSES) || '[]');
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.MOCK_COURSES, JSON.stringify(courses));
    return { success: true, source: 'local' };
  },

  // --- APPLICATIONS ---
  async submitApplication(applicationData) {
    const client = getSupabaseClient();

    if (client) {
      try {
        const payload = {
          course_title: applicationData.course_title || 'Selected Program',
          student_name: applicationData.student_name,
          student_email: applicationData.student_email,
          student_phone: applicationData.student_phone,
          experience_level: applicationData.experience_level || 'Beginner',
          preferred_timing: applicationData.preferred_timing || 'Weekend',
          statement: applicationData.statement || '',
          status: 'pending'
        };

        // Only include course_id if it's a valid PostgreSQL UUID
        if (applicationData.course_id && isValidUUID(applicationData.course_id)) {
          payload.course_id = applicationData.course_id;
        }

        const { data, error } = await client.from('applications').insert([payload]).select();
        if (error) {
          console.error('Supabase application submission error:', error);
          return { success: false, message: 'Supabase Error: ' + error.message, error };
        }
        if (data && data.length > 0) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.error('Supabase application submission exception:', err);
        return { success: false, message: err.message || 'Failed to submit to Supabase' };
      }
    }

    // Local fallback
    const newApp = {
      ...applicationData,
      id: 'app_' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    const apps = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_APPLICATIONS) || '[]');
    apps.unshift(newApp);
    localStorage.setItem(STORAGE_KEYS.MOCK_APPLICATIONS, JSON.stringify(apps));
    return { success: true, data: newApp, source: 'local' };
  },

  async getApplications() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { data, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase applications fetch failed:', err);
      }
    }

    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_APPLICATIONS) || '[]');
    return { data: local, source: 'local' };
  },

  async updateApplicationStatus(id, status, notes = '') {
    const client = getSupabaseClient();
    const updatePayload = { status, admin_notes: notes, updated_at: new Date().toISOString() };

    if (client) {
      try {
        const { data, error } = await client.from('applications').update(updatePayload).eq('id', id).select();
        if (!error && data) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase update application failed:', err);
      }
    }

    // Local fallback
    const apps = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_APPLICATIONS) || '[]');
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...updatePayload };
      localStorage.setItem(STORAGE_KEYS.MOCK_APPLICATIONS, JSON.stringify(apps));
      return { success: true, data: apps[index], source: 'local' };
    }
    return { success: false, message: 'Application not found' };
  },

  // --- INQUIRIES ---
  async submitInquiry(inquiryData) {
    const client = getSupabaseClient();

    if (client) {
      try {
        const payload = {
          full_name: inquiryData.full_name,
          email: inquiryData.email,
          phone: inquiryData.phone || '',
          subject: inquiryData.subject || 'General Inquiry',
          message: inquiryData.message,
          status: 'new'
        };

        const { data, error } = await client.from('inquiries').insert([payload]).select();
        if (error) {
          console.error('Supabase inquiry submission error:', error);
          return { success: false, message: 'Supabase Error: ' + error.message };
        }
        if (data && data.length > 0) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.error('Supabase inquiry submission exception:', err);
        return { success: false, message: err.message };
      }
    }

    // Local fallback
    const newInquiry = {
      ...inquiryData,
      id: 'inq_' + Date.now(),
      status: 'new',
      created_at: new Date().toISOString()
    };
    const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_INQUIRIES) || '[]');
    inquiries.unshift(newInquiry);
    localStorage.setItem(STORAGE_KEYS.MOCK_INQUIRIES, JSON.stringify(inquiries));
    return { success: true, data: newInquiry, source: 'local' };
  },

  async getInquiries() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { data, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase inquiries fetch failed:', err);
      }
    }

    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_INQUIRIES) || '[]');
    return { data: local, source: 'local' };
  },

  async updateInquiryStatus(id, status) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('inquiries').update({ status }).eq('id', id).select();
        if (!error && data) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase inquiry status update failed:', err);
      }
    }

    const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_INQUIRIES) || '[]');
    const index = inquiries.findIndex(i => i.id === id);
    if (index !== -1) {
      inquiries[index].status = status;
      localStorage.setItem(STORAGE_KEYS.MOCK_INQUIRIES, JSON.stringify(inquiries));
      return { success: true, data: inquiries[index], source: 'local' };
    }
    return { success: false, message: 'Inquiry not found' };
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements() {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true });

        if (!error && data && data.length > 0) {
          return { data, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase announcements fetch failed:', err);
      }
    }

    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS) || '[]');
    return { data: local, source: 'local' };
  },

  async addAnnouncement(announcement) {
    const client = getSupabaseClient();

    if (client) {
      try {
        const payload = {
          title: announcement.title,
          content: announcement.content,
          category: announcement.category || 'General',
          link_url: announcement.link_url || '',
          priority: parseInt(announcement.priority, 10) || 1,
          is_active: true
        };

        const { data, error } = await client.from('announcements').insert([payload]).select();
        if (error) {
          console.error('Supabase announcement insert error:', error);
          return { success: false, message: 'Supabase Error: ' + error.message };
        }
        if (data && data.length > 0) {
          return { success: true, data: data[0], source: 'supabase' };
        }
      } catch (err) {
        console.error('Supabase announcement insert exception:', err);
        return { success: false, message: err.message };
      }
    }

    const newAnn = {
      ...announcement,
      id: 'ann_' + Date.now(),
      is_active: true,
      created_at: new Date().toISOString()
    };
    const announcements = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS) || '[]');
    announcements.unshift(newAnn);
    localStorage.setItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS, JSON.stringify(announcements));
    return { success: true, data: newAnn, source: 'local' };
  },

  async deleteAnnouncement(id) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('announcements').delete().eq('id', id);
        if (!error) {
          return { success: true, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase announcement delete failed:', err);
      }
    }

    let announcements = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS) || '[]');
    announcements = announcements.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.MOCK_ANNOUNCEMENTS, JSON.stringify(announcements));
    return { success: true, source: 'local' };
  }
};
