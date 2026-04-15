import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Layout } from "@/react-app/components/Layout";
import { DashboardLayout } from "@/react-app/components/DashboardLayout";
import { ProtectedRoute } from "@/react-app/components/ProtectedRoute";
import HomePage from "@/react-app/pages/Home";
import CoursesPage from "@/react-app/pages/Courses";
import CourseDetailPage from "@/react-app/pages/CourseDetail";
import LoginPage from "@/react-app/pages/Login";
import RegisterPage from "@/react-app/pages/Register";

// Dashboards
import StudentDashboardPage from "@/react-app/pages/StudentDashboard";
import InstructorDashboardPage from "@/react-app/pages/InstructorDashboard";
import AdminDashboardPage from "@/react-app/pages/AdminDashboard";

// Admin Sub-pages
import AdminUsers from "@/react-app/pages/AdminUsers";
import AdminCourses from "@/react-app/pages/AdminCourses";
import AdminCategories from "@/react-app/pages/AdminCategories";
import AdminSettings from "@/react-app/pages/AdminSettings";

// Instructor Sub-pages
import InstructorCourses from "@/react-app/pages/InstructorCourses";
import InstructorNewCourse from "@/react-app/pages/InstructorNewCourse";
import InstructorEditCourse from "@/react-app/pages/InstructorEditCourse";
import InstructorStudents from "@/react-app/pages/InstructorStudents";
import InstructorEarnings from "@/react-app/pages/InstructorEarnings";
import InstructorMessages from "@/react-app/pages/InstructorMessages";

// Student Sub-pages
import StudentCertificates from "@/react-app/pages/StudentCertificates";
import StudentCourseViewer from "@/react-app/pages/StudentCourseViewer";
import StudentProfile from "@/react-app/pages/StudentProfile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/learning/:id" element={<ProtectedRoute allowedRoles={["student"]}><StudentCourseViewer /></ProtectedRoute>} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

            {/* Student Routes */}
            <Route path="/student">
              <Route index element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboardPage /></ProtectedRoute>} />
              <Route path="certificates" element={<ProtectedRoute allowedRoles={["student"]}><StudentCertificates /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
            </Route>

            {/* Instructor Routes */}
            <Route path="/instructor">
              <Route index element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorDashboardPage /></ProtectedRoute>} />
              <Route path="my-courses" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorCourses /></ProtectedRoute>} />
              <Route path="courses/:id/edit" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorEditCourse /></ProtectedRoute>} />
              <Route path="new" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorNewCourse /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorStudents /></ProtectedRoute>} />
              <Route path="earnings" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorEarnings /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorMessages /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <Route index element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCourses /></ProtectedRoute>} />
              <Route path="categories" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCategories /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
            </Route>

          </Route>
        </Route>

        {/* Auth routes without layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}
