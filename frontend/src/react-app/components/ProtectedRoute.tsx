import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/react-app/store/useAuthStore";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: ("admin" | "instructor" | "student")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to home or a specific unauthorized page
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
