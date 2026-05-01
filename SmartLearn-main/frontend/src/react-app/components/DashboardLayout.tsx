import { Outlet } from "react-router";
import { Sidebar } from "@/react-app/components/Sidebar";

export function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
