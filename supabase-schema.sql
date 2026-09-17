-- ==============================================================================
-- IT TRACK INSTITUTE - SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Software Engineering', 'Cyber Security', 'Cloud & DevOps', 'AI & Data Science', 'UI/UX Design', 'Networking'
    level TEXT NOT NULL DEFAULT 'Beginner to Advanced', -- 'Beginner', 'Intermediate', 'Advanced', 'All Levels'
    duration TEXT NOT NULL, -- e.g. '16 Weeks', '24 Weeks'
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    syllabus JSONB DEFAULT '[]'::jsonb, -- Array of curriculum topics or modules
    instructor TEXT DEFAULT 'Senior Industry Expert',
    badge TEXT DEFAULT 'Popular', -- 'Popular', 'Bestseller', 'New', 'Certification'
    image_url TEXT DEFAULT '',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    experience_level TEXT NOT NULL, -- 'Complete Beginner', 'Some Coding / IT Background', 'Working Professional'
    preferred_timing TEXT DEFAULT 'Weekend', -- 'Weekday Morning', 'Weekday Evening', 'Weekend Intensive'
    statement TEXT DEFAULT '',
    status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'accepted', 'rejected'
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INQUIRIES / CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANNOUNCEMENTS / NOTICE BOARD TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General', -- 'Admissions', 'Event', 'Workshop', 'Scholarship'
    link_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- COURSES POLICIES
-- Anyone can view active courses
CREATE POLICY "Public can view active courses" 
ON public.courses FOR SELECT 
USING (is_active = true);

-- Authenticated users (admin) can do full CRUD on courses
CREATE POLICY "Admins have full access to courses" 
ON public.courses FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also allow public anon access for demo/custom setups if unauthenticated API key is used
CREATE POLICY "Anon can manage courses if permitted"
ON public.courses FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- APPLICATIONS POLICIES
-- Public can submit enrollment applications
CREATE POLICY "Public can submit applications" 
ON public.applications FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Authenticated / Admin can view and update applications
CREATE POLICY "Admins have full access to applications" 
ON public.applications FOR ALL 
TO authenticated, anon
USING (true) 
WITH CHECK (true);

-- INQUIRIES POLICIES
-- Public can submit contact inquiries
CREATE POLICY "Public can submit inquiries" 
ON public.inquiries FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Authenticated / Admin can view and update inquiries
CREATE POLICY "Admins have full access to inquiries" 
ON public.inquiries FOR ALL 
TO authenticated, anon
USING (true) 
WITH CHECK (true);

-- ANNOUNCEMENTS POLICIES
-- Public can view active announcements
CREATE POLICY "Public can view announcements" 
ON public.announcements FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Admin can manage announcements
CREATE POLICY "Admins have full access to announcements" 
ON public.announcements FOR ALL 
TO authenticated, anon
USING (true) 
WITH CHECK (true);

-- ==============================================================================
-- SAMPLE SEED DATA
-- ==============================================================================

-- Insert Sample Courses
INSERT INTO public.courses (title, slug, category, level, duration, fee, description, syllabus, instructor, badge, is_featured)
VALUES 
(
    'Full Stack Web Development & Cloud',
    'full-stack-web-dev',
    'Software Engineering',
    'Beginner to Pro',
    '24 Weeks',
    1200.00,
    'Master modern web technologies from HTML5/CSS3 and TypeScript to React, Node.js, Express, PostgreSQL, and AWS cloud deployment with CI/CD.',
    '["Modern Frontend (HTML5, Tailwind, JavaScript ES6+, React.js)", "Backend API Mastery (Node.js, Express, REST & GraphQL)", "Database Design (PostgreSQL, Supabase, Redis, MongoDB)", "DevOps, Docker Containerization & Cloud Deployment on AWS", "Capstone Production Projects & Technical Interview Prep"]'::jsonb,
    'Alex Vance (Senior Full Stack Architect)',
    'Bestseller',
    true
),
(
    'Cybersecurity & Ethical Hacking Defense',
    'cybersecurity-ethical-hacking',
    'Cyber Security',
    'Intermediate',
    '20 Weeks',
    1450.00,
    'Comprehensive hands-on training covering penetration testing, network defense, threat intelligence, incident response, and preparation for CompTIA Security+ and CEH.',
    '["Networking Fundamentals, TCP/IP & Linux Administration", "Vulnerability Assessment & Network Penetration Testing", "Web Application Security (OWASP Top 10 & Burp Suite)", "SOC Operations, SIEM Monitoring, Incident Response & Forensics", "Ethical Hacking Labs & Certification Readiness"]'::jsonb,
    'Marcus Reed (Offensive Security Certified)',
    'High Demand',
    true
),
(
    'Cloud Architecture & DevOps Engineering',
    'cloud-architecture-devops',
    'Cloud & DevOps',
    'Intermediate to Advanced',
    '18 Weeks',
    1350.00,
    'Transform into a Cloud DevOps specialist. Master AWS, Terraform, Docker, Kubernetes orchestration, GitOps workflows, and enterprise automation.',
    '["Cloud Foundations on AWS & Azure Multi-Region Architecture", "Infrastructure as Code with Terraform & CloudFormation", "Container Orchestration with Docker and Kubernetes (EKS)", "CI/CD Automation with GitHub Actions, Jenkins & ArgoCD", "Site Reliability Engineering (SRE), Logging & Prometheus/Grafana"]'::jsonb,
    'Elena Rostova (Principal Cloud Engineer)',
    'Certification',
    true
),
(
    'Applied AI, Machine Learning & Data Science',
    'applied-ai-machine-learning',
    'AI & Data Science',
    'Beginner to Intermediate',
    '22 Weeks',
    1500.00,
    'Harness the power of Python, NumPy, Pandas, Scikit-Learn, Deep Learning with PyTorch, and generative AI LLM application engineering.',
    '["Python for Data Science, Statistical Analysis & EDA", "Machine Learning Algorithms, Supervised & Unsupervised Models", "Deep Learning Foundations, CNNs, Transformers & PyTorch", "Generative AI Engineering: Prompt Engineering, RAG & LLMs", "Production Model Deployment via FastAPI & Cloud Serving"]'::jsonb,
    'Dr. Aris Thorne (AI Research Lead)',
    'Featured',
    true
),
(
    'Enterprise Network Engineering & Cisco CCNA',
    'enterprise-network-engineering',
    'Networking',
    'Beginner to Intermediate',
    '16 Weeks',
    950.00,
    'Hands-on network design, routing, switching, wireless configuration, network security protocols, and comprehensive preparation for Cisco CCNA certification.',
    '["OSI Model, IP Addressing & Subnetting Mastery", "Cisco Router & Switch Configuration (VLANs, Trunking, STP)", "Routing Protocols (OSPF, BGP, Static Routing)", "Network Security, Firewalls, ACLs & VPN Tunnels", "CCNA Exam Simulator & Virtual Packet Tracer Labs"]'::jsonb,
    'David Chen (CCIE Certified Instructor)',
    'Popular',
    false
),
(
    'Product Design: UI/UX & Design Systems',
    'product-design-ui-ux',
    'UI/UX Design',
    'All Levels',
    '14 Weeks',
    890.00,
    'Craft user-centric digital experiences. Learn wireframing, interactive prototyping in Figma, user research, accessibility standards, and building scalable design systems.',
    '["User Research Methodologies, Personas & Journey Mapping", "Information Architecture, Wireframing & UX Copywriting", "Advanced Figma: Auto-Layout, Components & Variables", "Design Systems for Enterprise Web & Mobile Apps", "Usability Testing, Micro-interactions & Developer Handoff"]'::jsonb,
    'Sophie Lin (Lead Product Designer)',
    'Trending',
    false
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Announcements
INSERT INTO public.announcements (title, content, category, link_url, is_active, priority)
VALUES
(
    'Fall 2026 Batch Admissions Open',
    'Early-bird applications are now being accepted with a 20% scholarship on all flagship engineering diplomas until end of month.',
    'Admissions',
    '#courses',
    true,
    1
),
(
    'Hands-on Masterclass: Building Production AI Agents',
    'Join our weekend live workshop with industry architects exploring autonomous LLM workflows and LangChain.',
    'Workshop',
    '#apply',
    true,
    2
),
(
    'Career Fair & Tech Hiring Summit Announced',
    'Over 35 hiring partners will be conducting on-campus and virtual hiring drives for IT Track Institute graduates.',
    'Event',
    '#about',
    true,
    3
);

-- Insert Sample Applications for Admin Testing
INSERT INTO public.applications (course_title, student_name, student_email, student_phone, experience_level, preferred_timing, statement, status)
VALUES
(
    'Full Stack Web Development & Cloud',
    'Sarah Jenkins',
    'sarah.j@example.com',
    '+1 (555) 234-8901',
    'Some Coding / IT Background',
    'Weekday Evening',
    'Looking to transition from QA engineering into full stack software development.',
    'pending'
),
(
    'Cybersecurity & Ethical Hacking Defense',
    'Michael Torres',
    'm.torres@example.com',
    '+1 (555) 876-5432',
    'Working Professional',
    'Weekend Intensive',
    'System administrator looking to specialize in offensive security and threat hunting.',
    'under_review'
),
(
    'Applied AI, Machine Learning & Data Science',
    'Amina Khan',
    'amina.khan@example.com',
    '+1 (555) 432-1098',
    'Complete Beginner',
    'Weekday Morning',
    'Graduated in mathematics; enthusiastic about applying statistical modeling to AI.',
    'accepted'
);

-- Insert Sample Inquiries
INSERT INTO public.inquiries (full_name, email, phone, subject, message, status)
VALUES
(
    'Daniel Brooks',
    'dbrooks@enterprise.org',
    '+1 (555) 345-6789',
    'Corporate Cohort Training Inquiry',
    'We are looking to upskill a team of 15 engineers in Cloud DevOps and Kubernetes. Do you offer custom corporate schedules?',
    'new'
),
(
    'Jessica Parker',
    'jparker@techmail.com',
    '+1 (555) 678-9012',
    'Installment Payment Plans',
    'Hi! I would like to know if the Full Stack Web Development course has monthly installment payment plans available for students.',
    'in_progress'
);
