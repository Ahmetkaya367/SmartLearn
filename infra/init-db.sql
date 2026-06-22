-- ==========================================
-- 0. INITIALIZE DATABASES
-- ==========================================
CREATE DATABASE authdb;
CREATE DATABASE userdb;
CREATE DATABASE coursedb;
CREATE DATABASE reviewdb;
CREATE DATABASE enrollmentdb;
CREATE DATABASE paymentdb;

-- ==========================================
-- 1. AUTH SERVICE SCHEMA (authdb)
-- ==========================================
\c authdb

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_STUDENT')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'FROZEN', 'BANNED')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, email, password, full_name, role, status, active) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@learnify.com', '$2a$10$encoded_password', 'Ahmet Yılmaz', 'ROLE_ADMIN', 'ACTIVE', true),
('22222222-2222-2222-2222-222222222222', 'sarah@instructor.com', '$2a$10$encoded_password', 'Seda Yılmaz', 'ROLE_INSTRUCTOR', 'ACTIVE', true),
('33333333-3333-3333-3333-333333333333', 'student@learnify.com', '$2a$10$encoded_password', 'Can Demir', 'ROLE_STUDENT', 'ACTIVE', true),
('44444444-4444-4444-4444-444444444444', 'elif@example.com', '$2a$10$encoded_password', 'Elif Demir', 'ROLE_STUDENT', 'ACTIVE', true),
('55555555-5555-5555-5555-555555555555', 'burak@example.com', '$2a$10$encoded_password', 'Burak Yılmaz', 'ROLE_INSTRUCTOR', 'PENDING', true),
('66666666-6666-6666-6666-666666666666', 'mehmet@example.com', '$2a$10$encoded_password', 'Mehmet Ak', 'ROLE_STUDENT', 'ACTIVE', true),
('77777777-7777-7777-7777-777777777777', 'ayse@example.com', '$2a$10$encoded_password', 'Ayşe Yılmaz', 'ROLE_STUDENT', 'ACTIVE', true);

-- ==========================================
-- 2. USER SERVICE SCHEMA (userdb)
-- ==========================================
\c userdb

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'FROZEN', 'BANNED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id),
    learning_time_hours VARCHAR(50),
    certificates_count INT DEFAULT 0
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    course_id UUID NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(10)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value) VALUES 
('support_email', 'destek@smartlearn.com');

INSERT INTO user_profiles (id, email, full_name, avatar_url, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@learnify.com', 'Ahmet Yılmaz', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', 'ACTIVE'),
('22222222-2222-2222-2222-222222222222', 'sarah@instructor.com', 'Seda Yılmaz', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 'ACTIVE'),
('33333333-3333-3333-3333-333333333333', 'student@learnify.com', 'Can Demir', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'ACTIVE'),
('44444444-4444-4444-4444-444444444444', 'elif@example.com', 'Elif Demir', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 'ACTIVE'),
('55555555-5555-5555-5555-555555555555', 'burak@example.com', 'Burak Yılmaz', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', 'PENDING'),
('66666666-6666-6666-6666-666666666666', 'mehmet@example.com', 'Mehmet Ak', null, 'ACTIVE'),
('77777777-7777-7777-7777-777777777777', 'ayse@example.com', 'Ayşe Yılmaz', null, 'ACTIVE');

INSERT INTO user_stats (user_id, learning_time_hours, certificates_count) VALUES 
('33333333-3333-3333-3333-333333333333', '128sa', 5);

INSERT INTO certificates (id, user_id, course_id, course_title, issue_date, grade) VALUES 
('71111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Kapsamlı Web Geliştirme Eğitimi', '2024-01-15 10:00:00+00', 'A+'),
('72222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'TypeScript Uzmanlığı', '2023-12-10 14:00:00+00', 'A');

INSERT INTO messages (id, sender_id, receiver_id, content, is_read) VALUES 
('91111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Hocam 3. dersteki ödev hakkında bir sorum var.', FALSE),
('92222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Yeni kurs başvurunuz onaylandı.', TRUE);

-- ==========================================
-- 3. COURSE SERVICE SCHEMA (coursedb)
-- ==========================================
\c coursedb

CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    instructor_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    student_count INT DEFAULT 0,
    duration VARCHAR(50),
    thumbnail_url VARCHAR(500),
    video_preview_url VARCHAR(500),
    is_bestseller BOOLEAN DEFAULT FALSE,
    language VARCHAR(50),
    certificate_included BOOLEAN DEFAULT TRUE,
    -- PENDING_APPROVAL buraya eklendi!
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_APPROVAL')),
    instructor_bio TEXT,
    instructor_image VARCHAR(500),
    instructor_title VARCHAR(255),
    instructor_students INT DEFAULT 0,
    instructor_courses INT DEFAULT 0,
    instructor_rating DECIMAL(3, 2) DEFAULT 0.0,
    last_updated VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Varsayılan kategoriler
INSERT INTO course_categories (id, name) VALUES 
    (gen_random_uuid(), 'Yazılım'),
    (gen_random_uuid(), 'Veri Bilimi'),
    (gen_random_uuid(), 'Pazarlama'),
    (gen_random_uuid(), 'Tasarım'),
    (gen_random_uuid(), 'Finans'),
    (gen_random_uuid(), 'Fotoğrafçılık'),
    (gen_random_uuid(), 'İşletme'),
    (gen_random_uuid(), 'Bilişim ve Güvenlik');

CREATE TABLE course_sections (
    id UUID PRIMARY KEY, 
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL
);

CREATE TABLE course_lessons (
    id UUID PRIMARY KEY,
    section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration INT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'article', 'quiz')),
    video_url VARCHAR(500),
    is_preview BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    version INT DEFAULT 1
);

CREATE TABLE learning_outcomes (
    id SERIAL PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL
);

CREATE TABLE course_requirements (
    id SERIAL PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL
);

CREATE TABLE target_audience (
    id SERIAL PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    audience TEXT NOT NULL
);

CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, user_id)
);

INSERT INTO courses (id, title, description, instructor_id, category, price, original_price, rating, review_count, student_count, duration, level, thumbnail_url, is_bestseller, status) VALUES 
('a1111111-1111-1111-1111-111111111111', 'Kapsamlı Web Geliştirme Eğitimi', 'HTML, CSS, JavaScript, React ve Node.js ögrenin', '22222222-2222-2222-2222-222222222222', 'Yazılım', 49.99, 199.99, 4.8, 12543, 45230, '42 saat', 'Başlangıç', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop', TRUE, 'PUBLISHED'),
('88888888-8888-8888-8888-888888888888', 'İleri Seviye React Tasarım Kalıpları', 'İleri seviye React konseptleri', '22222222-2222-2222-2222-222222222222', 'Yazılım', 49.99, 150.00, 4.5, 120, 500, '30 saat', 'İleri', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop', FALSE, 'PUBLISHED');

INSERT INTO course_reviews (id, course_id, user_id, user_name, rating, comment) VALUES 
('61111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Can Demir', 5, 'Bu kurs tüm beklentilerimi aştı!');

INSERT INTO course_sections (id, course_id, title, order_index) VALUES 
('51111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Giriş & Kurulum', 1);

INSERT INTO course_lessons (id, section_id, title, duration, type, is_preview, order_index) VALUES 
('11111111-0000-0000-0000-000000000001', '51111111-1111-1111-1111-111111111111', 'Kursa Hoş Geldiniz', 332, 'video', TRUE, 1);

-- ==========================================
-- 4. REVIEW SERVICE SCHEMA (reviewdb) - MOVED TO COURSDB
-- ==========================================
\c reviewdb

-- reviewdb is kept for potential future separate microservice but current reviews are in coursedb

-- ==========================================
-- 5. ENROLLMENT SERVICE SCHEMA (enrollmentdb)
-- ==========================================
\c enrollmentdb

CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    progress_percent INT DEFAULT 0,
    paid_price DECIMAL(10,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    certificate_code VARCHAR(50) NOT NULL UNIQUE,
    certificate_url VARCHAR(500),
    student_name VARCHAR(255) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(255),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollment_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL,
    watched_seconds INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    lesson_version INT DEFAULT 1,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE enrollment_lessons_completed (
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (enrollment_id, lesson_id)
);

INSERT INTO enrollments (id, user_id, course_id, progress_percent, paid_price, last_accessed_at) VALUES 
('e1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 65, 49.99, '2024-02-28 15:00:00+00'),
('e2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 12, 49.99, '2024-03-08 10:00:00+00'),
('e3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 45, 49.99, '2024-03-10 14:30:00+00'),
('e4444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 78, 49.99, '2024-03-15 09:15:00+00'),
('e5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 23, 49.99, '2024-03-18 16:45:00+00');

-- ==========================================
-- 6. PAYMENT SERVICE SCHEMA (paymentdb)
-- ==========================================
\c paymentdb

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instructor_balances (
    instructor_id UUID PRIMARY KEY,
    total_balance DECIMAL(15, 2) DEFAULT 0.00,
    available_withdrawal DECIMAL(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instructor_monthly_earnings (
    instructor_id UUID NOT NULL,
    month VARCHAR(10) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (instructor_id, month)
);

CREATE TABLE instructor_transactions (
    id UUID PRIMARY KEY,
    instructor_id UUID NOT NULL,
    course_title VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 

INSERT INTO orders (id, user_id, course_id, amount) VALUES ('41111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 49.99);
INSERT INTO instructor_balances (instructor_id, total_balance, available_withdrawal) VALUES ('22222222-2222-2222-2222-222222222222', 12500, 4200);
INSERT INTO instructor_transactions (id, instructor_id, course_title, amount, status) VALUES 
('81111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'İleri Seviye React Tasarım Kalıpları', 49.99, 'Tamamlandı');