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
        const user: User = {
            id: data.id,
            name: data.fullName,
            email: data.email,
            role: data.role.replace("ROLE_", "").toLowerCase() as any,
            avatar: data.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        };
        localStorage.setItem("auth_token", data.accessToken);
        return { user, token: data.accessToken };
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
            category: data.category,
            price: parseFloat(data.price),
            originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
            rating: data.rating,
            reviewCount: data.reviewCount || 0,
            studentCount: data.studentCount || 0,
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

        if (!response.ok) throw new Error("Course creation failed");
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

    getInstructorEarnings: async () => {
        await delay(800);
        return instructorEarnings;
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

    getStudentCertificates: async () => {
        await delay(800);
        return studentCertificates;
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
};