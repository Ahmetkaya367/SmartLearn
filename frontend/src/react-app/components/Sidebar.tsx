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
        { name: "Panel", href: "/admin", icon: LayoutDashboard },
        { name: "Kullanıcılar", href: "/admin/users", icon: Users },
        { name: "Kurslar", href: "/admin/courses", icon: BookOpen },
        { name: "Kategoriler", href: "/admin/categories", icon: BarChart3 },
        { name: "Ayarlar", href: "/admin/settings", icon: Settings },
    ];

    const instructorLinks = [
        { name: "Panel", href: "/instructor", icon: LayoutDashboard },
        { name: "Kurslarım", href: "/instructor/my-courses", icon: BookOpen },
        { name: "Yeni Kurs", href: "/instructor/new", icon: PlusCircle },
        { name: "Öğrenciler", href: "/instructor/students", icon: Users },
        { name: "Kazançlar", href: "/instructor/earnings", icon: Wallet },
        { name: "Mesajlar", href: "/instructor/messages", icon: MessageSquare },
        { name: "Profil", href: "/instructor/profile", icon: Settings },
    ];

    const studentLinks = [
        { name: "Öğrenimim", href: "/student", icon: LayoutDashboard },
        { name: "Sertifikalar", href: "/student/certificates", icon: GraduationCap },
        { name: "Mesajlar", href: "/student/messages", icon: MessageSquare },
        { name: "Profil", href: "/student/profile", icon: Settings },
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
