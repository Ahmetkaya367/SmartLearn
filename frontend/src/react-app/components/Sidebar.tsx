import { Link, useLocation } from "react-router";
import { cn } from "@/react-app/lib/utils";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    BarChart3,
    PlusCircle,
    MessageSquare,
    Wallet,
    GraduationCap
} from "lucide-react";
import { useAuthStore } from "@/react-app/store/useAuthStore";

export function Sidebar() {
    const { user } = useAuthStore();
    const location = useLocation();

    if (!user) return null;

    const adminLinks = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Courses", href: "/admin/courses", icon: BookOpen },
        { name: "Categories", href: "/admin/categories", icon: BarChart3 },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const instructorLinks = [
        { name: "Dashboard", href: "/instructor", icon: LayoutDashboard },
        { name: "My Courses", href: "/instructor/my-courses", icon: BookOpen },
        { name: "New Course", href: "/instructor/new", icon: PlusCircle },
        { name: "Students", href: "/instructor/students", icon: Users },
        { name: "Earnings", href: "/instructor/earnings", icon: Wallet },
        { name: "Messages", href: "/instructor/messages", icon: MessageSquare },
    ];

    const studentLinks = [
        { name: "My Learning", href: "/student", icon: LayoutDashboard },
        { name: "Discover", href: "/courses", icon: BookOpen },
        { name: "Certificates", href: "/student/certificates", icon: GraduationCap },
        { name: "Profile", href: "/student/profile", icon: Settings },
    ];

    const links = user.role === "admin" ? adminLinks : user.role === "instructor" ? instructorLinks : studentLinks;

    return (
        <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = location.pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
