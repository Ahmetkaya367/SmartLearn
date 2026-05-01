import {
    users,
    courses as coreCourses,
    courseDetails,
    adminStats,
    instructorStats,
    studentStats,
    adminUsers,
    instructorEarnings,
    studentCertificates,
    messages
} from "@/data/seed";
import type { User } from "@/data/seed";
import type { Course } from "@/data/courses";
import type { CourseDetail } from "@/data/courseDetails";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_URL = "http://127.0.0.1:8080";
const USE_MOCK = false; // Set to true to use seed data

const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
};

export const apiService = {
    // Auth
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
        if (USE_MOCK) {
            await delay(800);
            const user = users.find((u) => u.email === email);
            if (!user) throw new Error("User not found");
            return { user, token: "mock-jwt-token" };
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Login failed");
        }
        const data = await response.json();
        
        // Fetch full profile info from User Service to get latest avatar and name
        let avatarUrl = data.avatarUrl;
        let fullName = data.fullName;
        
        try {
            const profileRes = await fetch(`${API_URL}/api/users/${data.id}`, {
                headers: { "Authorization": `Bearer ${data.accessToken}` }
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                avatarUrl = profileData.avatarUrl;
                fullName = profileData.fullName;
            }
        } catch (e) {
            console.warn("Could not fetch profile details, using default auth info");
        }

        const user: User = {
            id: data.id,
            name: fullName || data.fullName,
            email: data.email,
            role: data.role.replace("ROLE_", "").toLowerCase() as any,
            avatar: avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        };
        localStorage.setItem("auth_token", data.accessToken);
        return { user, token: data.accessToken };
    },

    register: async (data: { name: string; email: string; password: string; role: string }) => {
        if (USE_MOCK) {
            await delay(800);
            return { message: "Mock registration successful" };
        }

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: data.name,
                email: data.email,
                password: data.password,
                role: data.role.toUpperCase()
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Registration failed");
        }
        
        try {
            return await response.json();
        } catch(e) {
            return { success: true };
        }
    },

    // Courses
    getCourses: async (): Promise<Course[]> => {
        if (USE_MOCK) {
            await delay(1000);
            return coreCourses;
        }

        const response = await fetch(`${API_URL}/api/courses`, {
            headers: getHeaders()
        });
        if (!response.ok) return coreCourses;
        const data = await response.json();
        return data.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            instructorId: course.instructorId,
            category: course.category,
            price: parseFloat(course.price),
            originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : undefined,
            rating: course.rating,
            reviewCount: course.reviewCount,
            studentCount: course.studentCount,
            duration: course.duration,
            level: course.level,
            thumbnail: course.thumbnail,
            isBestseller: course.isBestseller,
            published: course.published ?? true,
            updatedAt: course.updatedAt,
            status: course.status || "PUBLISHED"
        }));
    },

    getAllCourses: async (): Promise<Course[]> => {
        if (USE_MOCK) {
            await delay(1000);
            return coreCourses;
        }

        const response = await fetch(`${API_URL}/api/courses/all`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            instructorId: course.instructorId,
            category: course.category,
            price: parseFloat(course.price),
            originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : undefined,
            rating: course.rating,
            reviewCount: course.reviewCount,
            studentCount: course.studentCount,
            duration: course.duration,
            level: course.level,
            thumbnail: course.thumbnail,
            isBestseller: course.isBestseller,
            published: course.published ?? true,
            updatedAt: course.updatedAt,
            status: course.status || "PUBLISHED"
        }));
    },

    approveCourse: async (id: string) => {
        const response = await fetch(`${API_URL}/api/courses/${id}/publish`, {
            method: "POST",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Approval failed");
        return await response.json();
    },

    rejectCourse: async (id: string) => {
        const response = await fetch(`${API_URL}/api/courses/${id}/reject`, {
            method: "POST",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Rejection failed");
        return await response.json();
    },

    getCourseById: async (id: string): Promise<CourseDetail> => {
        if (USE_MOCK) {
            await delay(600);
            const detail = courseDetails[id];
            if (!detail) throw new Error("Course not found");
            return detail;
        }

        const response = await fetch(`${API_URL}/api/courses/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            const detail = courseDetails[id];
            if (detail) return detail;
            throw new Error("Course not found");
        }
        const data = await response.json();
        return {
            id: data.id,
            title: data.title,
            description: data.description,
            instructor: data.instructor,
            instructorId: data.instructorId,
            category: data.category,
            price: parseFloat(data.price),
            originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
            rating: data.rating,
            reviewCount: data.reviewCount || 0,
            studentCount: data.studentCount || 0,
            level: data.level,
            thumbnail: data.thumbnail,
            image: data.thumbnail, // Alias for component
            duration: data.duration,
            updatedAt: data.updatedAt || data.lastUpdated,
            videoPreviewUrl: data.videoPreviewUrl,
            longDescription: data.longDescription,
            learningOutcomes: data.learningOutcomes || [],
            whatYouWillLearn: data.learningOutcomes || [], // Alias for component
            requirements: data.requirements || [],
            targetAudience: data.targetAudience || [],
            sections: data.sections?.map((section: any) => ({
                id: section.id,
                title: section.title,
                orderIndex: section.orderIndex,
                lessons: section.lessons?.map((lesson: any) => ({
                    id: lesson.id,
                    title: lesson.title,
                    duration: lesson.duration,
                    type: lesson.type,
                    isPreview: lesson.isPreview,
                    videoUrl: lesson.videoUrl  // ← CRITICAL: was missing
                })) || []
            })) || [],
            curriculum: data.sections?.map((section: any) => ({
                id: section.id,
                title: section.title,
                orderIndex: section.orderIndex,
                lessons: section.lessons?.map((lesson: any) => ({
                    id: lesson.id,
                    title: lesson.title,
                    duration: lesson.duration,
                    type: lesson.type,
                    isPreview: lesson.isPreview,
                    videoUrl: lesson.videoUrl  // ← CRITICAL: was missing
                })) || []
            })) || [], // Alias for component
            instructorBio: data.instructorBio,
            instructorImage: data.instructorImage,
            instructorTitle: data.instructorTitle,
            instructorStudents: data.instructorStudents || 0,
            instructorCourses: data.instructorCourses || 0,
            instructorRating: data.instructorRating || 0,
            reviews: data.reviews || [], // Use data.reviews if available
            language: data.language,
            lastUpdated: data.lastUpdated || data.updatedAt,
            certificateIncluded: data.certificateIncluded,
            status: data.status
        };
    },

    // Admin
    getAdminStats: async () => {
        if (USE_MOCK) {
            await delay(800);
            return adminStats;
        }

        const response = await fetch(`${API_URL}/api/users/stats/admin`, {
            headers: getHeaders()
        });
        if (!response.ok) return adminStats;
        return await response.json();
    },

    getAdminUsers: async () => {
        if (USE_MOCK) {
            await delay(800);
            return adminUsers;
        }

        const response = await fetch(`${API_URL}/api/users`, {
            headers: getHeaders()
        });
        if (!response.ok) return adminUsers;
        const data = await response.json();
        return data.map((u: any) => ({
            ...u,
            role: u.role.toLowerCase(),
            avatar: u.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        }));
    },

    // Instructor
    getInstructorStats: async () => {
        if (USE_MOCK) {
            await delay(800);
            return instructorStats;
        }

        const response = await fetch(`${API_URL}/api/users/stats/instructor`, {
            headers: getHeaders()
        });
        if (!response.ok) return instructorStats;
        return await response.json();
    },

    getInstructorStatsByInstructorId: async (instructorId: string) => {
        if (USE_MOCK) return { courseCount: 0, totalStudents: 0 };
        try {
            const response = await fetch(`${API_URL}/api/enrollments/instructor/${instructorId}/stats`, {
                headers: getHeaders()
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (_) {
            return null;
        }
    },

    getCoursesByInstructorId: async (instructorId: string): Promise<Course[]> => {
        if (USE_MOCK) return [];
        const response = await fetch(`${API_URL}/api/courses/instructor/${instructorId}`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            category: course.category,
            price: parseFloat(course.price),
            originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : undefined,
            rating: course.rating,
            reviewCount: course.reviewCount,
            studentCount: course.studentCount,
            duration: course.duration,
            level: course.level,
            thumbnail: course.thumbnail,
            isBestseller: course.isBestseller,
            published: course.published ?? true,
            updatedAt: course.updatedAt,
            status: course.status
        }));
    },

    getInstructorCourses: async (): Promise<Course[]> => {
        if (USE_MOCK) {
            await delay(800);
            return coreCourses.filter(c => c.instructor === "Sarah Johnson");
        }

        const response = await fetch(`${API_URL}/api/courses/instructor`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor || "Sarah Johnson",
            category: course.category,
            price: parseFloat(course.price),
            originalPrice: course.originalPrice ? parseFloat(course.originalPrice) : undefined,
            rating: course.rating,
            reviewCount: course.reviewCount,
            studentCount: course.studentCount,
            duration: course.duration,
            level: course.level,
            thumbnail: course.thumbnail,
            isBestseller: course.isBestseller,
            published: course.published ?? true,
            updatedAt: course.updatedAt || course.lastUpdated,
            status: course.status
        }));
    },

    createCourse: async (courseData: any) => {
        if (USE_MOCK) {
            await delay(1000);
            return { id: Math.random().toString(), ...courseData };
        }

        const response = await fetch(`${API_URL}/api/courses`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(courseData)
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error("Course creation failed: " + errBody);
        }
        return await response.json();
    },

    updateCourse: async (id: string, courseData: any) => {
        if (USE_MOCK) {
            await delay(1000);
            return courseData;
        }

        const response = await fetch(`${API_URL}/api/courses/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(courseData)
        });

        if (!response.ok) throw new Error("Course update failed");
        return await response.json();
    },

    deleteCourse: async (id: string) => {
        const response = await fetch(`${API_URL}/api/courses/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(err || "Kurs silinemedi");
        }
        return true;
    },

    uploadMedia: async (file: File) => {
        if (USE_MOCK) {
            await delay(1000);
            return { url: URL.createObjectURL(file) };
        }

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("auth_token");
        const headers: HeadersInit = {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };

        const response = await fetch(`${API_URL}/api/courses/media/upload`, {
            method: "POST",
            headers,
            body: formData
        });

        if (!response.ok) throw new Error("Media upload failed");
        return await response.json();
    },

    getInstructorEarnings: async (instructorId: string) => {
        if (USE_MOCK) {
            await delay(800);
            return instructorEarnings;
        }

        const response = await fetch(`${API_URL}/api/enrollments/instructor/${instructorId}/history`, {
            headers: getHeaders()
        });
        if (!response.ok) return instructorEarnings;
        return await response.json();
    },

    getMessages: async () => {
        await delay(800);
        return messages;
    },

    getInstructorStudents: async (instructorId: string) => {
        if (USE_MOCK) {
            await delay(800);
            return [];
        }

        const response = await fetch(`${API_URL}/api/enrollments/instructor/${instructorId}/students`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    // Student
    getStudentStats: async () => {
        if (USE_MOCK) {
            await delay(800);
            return studentStats;
        }

        const response = await fetch(`${API_URL}/api/users/stats/student`, {
            headers: getHeaders()
        });
        if (!response.ok) return studentStats;
        return await response.json();
    },

    checkoutCart: async (userId: string, courseIds: string[]) => {
        const response = await fetch(`${API_URL}/api/enrollments/enroll`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ userId, courseIds })
        });
        if (!response.ok) throw new Error("Failed to enroll");
        return await response.json();
    },

    updateLessonProgress: async (enrollmentId: string, lessonId: string, watchedSeconds: number, isCompleted: boolean = false) => {
        const response = await fetch(`${API_URL}/api/enrollments/progress/update`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ enrollmentId, lessonId, watchedSeconds, isCompleted })
        });
        if (!response.ok) return null;
        return await response.json();
    },

    getEnrollmentProgress: async (enrollmentId: string) => {
        const response = await fetch(`${API_URL}/api/enrollments/${enrollmentId}/progress`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    getEnrollment: async (enrollmentId: string) => {
        const response = await fetch(`${API_URL}/api/enrollments/${enrollmentId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Failed to fetch enrollment");
        return await response.json();
    },

    getEnrollmentById: async (id: string) => {
        const response = await fetch(`${API_URL}/api/enrollments/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Enrollment not found");
        return await response.json();
    },

    uploadCertificate: async (enrollmentId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("enrollmentId", enrollmentId);

        const token = localStorage.getItem("auth_token");
        const headers: HeadersInit = {
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };

        const response = await fetch(`${API_URL}/api/enrollments/${enrollmentId}/certificate`, {
            method: "POST",
            headers,
            body: formData
        });

        if (!response.ok) throw new Error("Sertifika yüklenemedi.");
        return await response.json();
    },

    getStudentCertificates: async () => {
        if (USE_MOCK) return studentCertificates;
        const response = await fetch(`${API_URL}/api/enrollments/certificates/me`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    getUserProfile: async (userId: string) => {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Profil bulunamadı");
        return await response.json();
    },

    banUser: async (id: string) => {
        const response = await fetch(`${API_URL}/api/users/${id}/ban`, {
            method: "POST",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("User ban failed");
        return true;
    },

    activateUser: async (id: string) => {
        const response = await fetch(`${API_URL}/api/users/${id}/activate`, {
            method: "POST",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("User activation failed");
        return true;
    },

    getMessageThread: async (otherUserId: string) => {
        const response = await fetch(`${API_URL}/api/messages/thread/${otherUserId}`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    sendMessage: async (receiverId: string, content: string) => {
        const response = await fetch(`${API_URL}/api/messages/send`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ receiverId, content })
        });
        if (!response.ok) throw new Error("Mesaj gönderilemedi");
        return await response.json();
    },

    getConversations: async () => {
        const response = await fetch(`${API_URL}/api/messages/conversations`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    getEligibleContacts: async () => {
        const response = await fetch(`${API_URL}/api/messages/eligible-contacts`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    // Categories (Managed via Course Service without separate table)
    getCategories: async (): Promise<string[]> => {
        const response = await fetch(`${API_URL}/api/courses/categories`, {
            headers: getHeaders()
        });
        if (!response.ok) return [
            "Yazılım", "Veri Bilimi", "Pazarlama", "Tasarım", 
            "Finans", "Fotoğrafçılık", "İşletme", "Bilişim ve Güvenlik"
        ];
        return await response.json();
    },

    renameCategory: async (oldName: string, newName: string) => {
        const response = await fetch(`${API_URL}/api/courses/categories/rename`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({ oldName, newName })
        });
        if (!response.ok) throw new Error("Kategori güncellenemedi.");
        return true;
    },

    addCategory: async (name: string) => {
        const response = await fetch(`${API_URL}/api/courses/categories`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error("Kategori eklenemedi.");
        return true;
    },

    deleteCategory: async (name: string) => {
        const response = await fetch(`${API_URL}/api/courses/categories/${name}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Kategori silinemedi.");
        return true;
    },

    updateUserProfile: async (userId: string, data: any) => {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Profil güncellenemedi.");
        return await response.json();
    },

    changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
        const response = await fetch(`${API_URL}/api/auth/users/${userId}/password`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: "Şifre değiştirilemedi" }));
            throw new Error(err.message || "Mevcut şifre hatalı veya bir sorun oluştu.");
        }
        return true;
    },

    getSystemSettings: async () => {
        const response = await fetch(`${API_URL}/api/site-settings`, {
            headers: getHeaders()
        });
        if (!response.ok) return { support_email: "destek@smartlearn.com" };
        return await response.json();
    },

    updateSystemSettings: async (settings: Record<string, string>) => {
        const response = await fetch(`${API_URL}/api/site-settings`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(settings)
        });
        if (!response.ok) throw new Error("Ayarlar güncellenemedi.");
        return true;
    },

    // Reviews & Ratings
    submitReview: async (courseId: string, rating: number, comment: string, userName?: string) => {
        const response = await fetch(`${API_URL}/api/reviews`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ courseId, rating, comment, userName })
        });
        if (!response.ok) throw new Error("Değerlendirme gönderilemedi.");
        return await response.json();
    },

    getCourseReviews: async (courseId: string) => {
        const response = await fetch(`${API_URL}/api/reviews/course/${courseId}`, {
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    },

    getCourseReviewSummary: async (courseId: string) => {
        const response = await fetch(`${API_URL}/api/reviews/course/${courseId}/summary`, {
            headers: getHeaders()
        });
        if (!response.ok) return { averageRating: 0, reviewCount: 0 };
        return await response.json();
    },

    getLessonProgress: async (enrollmentId: string, lessonId: string) => {
        const response = await fetch(`${API_URL}/api/enrollments/progress/${enrollmentId}/${lessonId}`, {
            headers: getHeaders()
        });
        if (!response.ok) return { watchedSeconds: 0 };
        return await response.json();
    },

    getLastWatchedLesson: async (enrollmentId: string) => {
        const response = await fetch(`${API_URL}/api/enrollments/progress/${enrollmentId}/last`, {
            headers: getHeaders()
        });
        if (!response.ok) return { watchedSeconds: 0 };
        return await response.json();
    },

    getUserReviewForCourse: async (userId: string, courseId: string) => {
        const response = await fetch(`${API_URL}/api/reviews/user/${userId}/course/${courseId}`, {
            headers: getHeaders()
        });
        if (!response.ok) return { exists: false };
        return await response.json();
    },

    getCourseEnrollmentCount: async (courseId: string) => {
        const response = await fetch(`${API_URL}/api/enrollments/course/${courseId}/count`, {
            headers: getHeaders()
        });
        if (!response.ok) return 0;
        return await response.json();
    },

    getAIRecommendations: async (userId: string): Promise<{ message: string }> => {
        try {
            const response = await fetch(`${API_URL}/api/assistant/recommendations?userId=${userId}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error("Failed to fetch AI recommendations");
            return await response.json();
        } catch (error) {
            console.error("AI Assistant error:", error);
            return { message: "Üzgünüz, şu an asistan servisine ulaşılamıyor. Lütfen daha sonra tekrar deneyin." };
        }
    },

    chatWithAI: async (message: string, userId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/assistant/chat?userId=${userId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ message })
            });
            if (!response.ok) throw new Error("Failed to chat with AI");
            return await response.json();
        } catch (error) {
            console.error("AI Chat error:", error);
            return { message: "Mesajınız iletilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin." };
        }
    },
};