import type { Course } from "./courses";
import type { CourseDetail } from "./courseDetails";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "instructor" | "student";
    avatar: string;
}

export const users: User[] = [
    {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Ahmet Yılmaz",
        email: "admin@learnify.com",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Seda Yılmaz",
        email: "sarah@instructor.com",
        role: "instructor",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Can Demir",
        email: "student@learnify.com",
        role: "student",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
];

export const adminStats = {
    totalUsers: 1250,
    totalCourses: 48,
    totalRevenue: 52400,
    growthRate: 12.5,
    recentUsers: [
        { id: "66666666-6666-6666-6666-666666666666", name: "Mehmet Ak", email: "mehmet@example.com", joinedAt: "2024-03-01" },
        { id: "77777777-7777-7777-7777-777777777777", name: "Ayşe Yılmaz", email: "ayse@example.com", joinedAt: "2024-03-02" },
    ],
    pendingApprovals: [
        { id: "88888888-8888-8888-8888-888888888888", title: "İleri Seviye React Tasarım Kalıpları", instructor: "Davut Kaya", submittedAt: "2024-03-01" },
    ],
};

export const instructorStats = {
    totalCourses: 5,
    totalStudents: 87450,
    totalRevenue: 125000,
    thisMonthRevenue: 8400,
    myCourses: [
        "a1111111-1111-1111-1111-111111111111",
        "a5555555-5555-5555-5555-555555555555",
        "a0000000-0000-0000-0000-000000000000"
    ],
};

export const studentStats = {
    enrolledCourses: [
        "a1111111-1111-1111-1111-111111111111",
        "a2222222-2222-2222-2222-222222222222"
    ],
    learningTime: "128s",
    certificates: 5,
    inProgress: [
        { courseId: "a1111111-1111-1111-1111-111111111111", progress: 65, lastAccessed: "2024-02-28" },
        { courseId: "a2222222-2222-2222-2222-222222222222", progress: 12, lastAccessed: "2024-03-01" },
    ],
};

// ... existing imports ...

export const adminUsers = [
    ...users,
    { id: "44444444-4444-4444-4444-444444444444", name: "Elif Demir", email: "elif@example.com", role: "student", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", status: "Aktif" },
    { id: "55555555-5555-5555-5555-555555555555", name: "Burak Yılmaz", email: "burak@example.com", role: "instructor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", status: "Beklemede" },
];

export const instructorEarnings = {
    totalBalance: 12500,
    availableWithdrawal: 4200,
    monthlyEarnings: [
        { month: "Ocak", amount: 2100 },
        { month: "Şubat", amount: 2800 },
        { month: "Mart", amount: 3500 },
    ],
    transactions: [
        { id: "81111111-1111-1111-1111-111111111111", course: "İleri Seviye React Tasarım Kalıpları", amount: 49.99, date: "2024-03-01", status: "Tamamlandı" },
        { id: "82222222-2222-2222-2222-222222222222", course: "UI/UX Tasarımı: Başlangıçtan Profesyonelliğe", amount: 29.99, date: "2024-02-28", status: "Tamamlandı" },
    ]
};

export const studentCertificates = [
    { id: "71111111-1111-1111-1111-111111111111", courseTitle: "Kapsamlı Web Geliştirme Eğitimi", issueDate: "2024-01-15", grade: "A+" },
    { id: "72222222-2222-2222-2222-222222222222", courseTitle: "TypeScript Uzmanlığı", issueDate: "2023-12-10", grade: "A" },
];

export const messages = [
    { id: "91111111-1111-1111-1111-111111111111", sender: "Can Demir", content: "Hocam 3. dersteki ödev hakkında bir sorum var.", time: "2sa önce", read: false },
    { id: "92222222-2222-2222-2222-222222222222", sender: "Ahmet Yılmaz", content: "Yeni kurs başvurunuz onaylandı.", time: "1g önce", read: true },
];

// Re-exporting from existing data for now
export { courses, categories, levels, priceRanges } from "./courses";
export { courseDetails } from "./courseDetails";
