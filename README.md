# IT Track Institute Website & Admin Panel (with Supabase Backend)

A modern, high-converting website and administrative management portal for **IT Track Institute**, built with clean HTML5, CSS3, modern JavaScript, and complete **Supabase** backend integration.

---

## 🌟 Key Features

### 1. Public Institute Portal (`index.html`)
- **Modern Tech Design**: Sleek dark/light contrast theme with gradient highlights, responsive layout, and smooth animations.
- **Dynamic Course Catalog**: Filterable tracks (*Software Engineering, Cyber Security, Cloud & DevOps, Applied AI & Data Science, Cisco Networking, UI/UX Design*).
- **Interactive Syllabus Modal**: Deep-dive curriculum breakdown, duration, fee, and instructor information.
- **Online Student Application Form**: Students can apply directly for their chosen program with schedule preferences and background info. Submissions flow directly to Supabase (`applications` table).
- **Notice Board / Announcements Ticker**: Live banner fetching upcoming batches, events, and scholarships from Supabase (`announcements` table).
- **Inquiries & Contact Form**: Prospective students can submit questions directly to the Supabase backend (`inquiries` table).
- **Alumni Reviews & Trust Signals**: Placement stats, alumni testimonials, and hiring partner logos.

### 2. Admin Management Dashboard (`admin.html`)
- **Authentication**:
  - Supabase Auth integration (email/password).
  - **Quick Demo Bypass**: Test the entire admin dashboard immediately with 1-click without any setup.
- **Executive Dashboard (KPIs)**: Total applications, active courses, leads, and notices at a glance.
- **Course Track Manager (Full CRUD)**:
  - Add new courses with fee, duration, level, description, and module syllabus.
  - Edit or delete courses.
- **Student Admissions & Applications Manager**:
  - Filter applicants by status (`Pending`, `Under Review`, `Accepted`, `Rejected`).
  - Update application status with real-time feedback.
  - View detailed student profiles and add internal confidential admissions notes.
- **Inquiries & Leads Inbox**:
  - Review incoming student messages and questions.
  - Mark inquiries as `New` or `Responded`.
- **Notice Board Manager**:
  - Publish announcements, webinars, and scholarships with custom link targets.
- **Live Supabase Settings Panel**:
  - Configure your Supabase Project URL and Public Anon Key directly inside the browser UI (stored in `localStorage`).
  - Built-in **Test Connection** button to verify database status.
  - Easy toggle between live Supabase and offline fallback mode.

---

## 🚀 Getting Started

### Option A: Immediate Preview (Works Out-Of-The-Box)
The application includes a built-in **Smart Offline/Demo Mode**. All data (courses, applications, announcements, inquiries) is pre-seeded with sample records so you can run and test everything right away.

Simply double click `index.html` or `admin.html` in your file explorer to open it in your web browser, or start a lightweight local web server:

```powershell
# Using Python
python -m http.server 3000

# Or using npx
npx serve .
```
Then visit `http://localhost:3000`.

---

## 🔌 Connecting to Your Supabase Backend

Connecting your real Supabase database takes less than 2 minutes:

### Step 1: Create a Free Project on Supabase
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **"New project"**, name it `it-track-institute`, set a database password, and create the project.

### Step 2: Run the Database Schema
1. In your Supabase Dashboard, click **SQL Editor** from the left navigation menu.
2. Click **"New query"**.
3. Open [`supabase-schema.sql`](./supabase-schema.sql) in this directory, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click **"Run"** (or press `Ctrl + Enter`).
   - This creates the `courses`, `applications`, `inquiries`, and `announcements` tables.
   - It sets up Row Level Security (RLS) policies.
   - It populates seed courses, announcements, and sample applications.

### Step 3: Connect Credentials in the Website
You can connect in either of two ways:

#### Way 1: Through the Admin UI (No code editing!)
1. Open `admin.html` in your browser.
2. Click **"Quick Demo Bypass"** to enter the dashboard.
3. Click **"Supabase Settings"** in the sidebar.
4. In your Supabase Dashboard, go to **Project Settings &rarr; API**.
5. Copy your **Project URL** and **anon public Key** and paste them into the input fields.
6. Click **"Save Credentials & Reconnect"** &rarr; click **"Test Connection"**.
7. The status indicator will turn green with **"Supabase Connected"**!

#### Way 2: In Code (`js/supabase-config.js`)
Edit lines 11-14 in `js/supabase-config.js`:
```javascript
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'
};
```

---

## 📂 Project Structure

```text
├── index.html               # Public IT Track Institute portal
├── admin.html               # Administrative Management Dashboard
├── supabase-schema.sql      # PostgreSQL tables, RLS policies, and seed data
├── README.md                # Documentation and setup instructions
├── css/
│   ├── style.css            # Public styles (modern tech design, responsive)
│   └── admin.css            # Admin dashboard styles (sidebar, KPI cards, tables)
└── js/
    ├── supabase-config.js   # Supabase client initializer & fallback data layer
    ├── main.js              # Public site behavior (filtering, modal, form submission)
    └── admin.js             # Admin logic (Auth, CRUD, application review, inquiries)
```

---

## 🛡️ Row Level Security (RLS) Summary
The database includes secure default RLS rules:
- **`courses`**: Anyone can read active courses; administrators have full CRUD.
- **`applications`**: Prospective students can submit applications; administrators can view and update statuses.
- **`inquiries`**: Anyone can submit an inquiry; administrators can read and update response status.
- **`announcements`**: Active announcements are visible publicly; administrators can publish and manage them.

---

## 🌐 Deployment
This website is 100% static and serverless. You can deploy it for free anywhere:
- **Vercel**: Drag-and-drop or push to GitHub.
- **Netlify**: Drag-and-drop this folder into the Netlify dashboard.
- **GitHub Pages**: Push to a repository and enable GitHub Pages under Settings.
- **Cloudflare Pages / Supabase Storage**: Host directly as static assets.
