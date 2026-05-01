import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Badge } from "@/react-app/components/ui/badge";
import { Search, MoreVertical, Shield, UserX, UserCheck } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await apiService.getAdminUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBan = async (id: string) => {
        try {
            await apiService.banUser(id);
            setUsers(users.map(u => u.id === id ? { ...u, status: 'BANNED' } : u));
        } catch (error) {
            console.error("Ban failed:", error);
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await apiService.activateUser(id);
            setUsers(users.map(u => u.id === id ? { ...u, status: 'ACTIVE' } : u));
        } catch (error) {
            console.error("Activation failed:", error);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kullanıcı Yönetimi</h1>
                    <p className="text-muted-foreground">Sistemdeki tüm kullanıcıları kontrol edin ve yetkilendirin.</p>
                </div>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Kullanıcı ara..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold">User</th>
                                <th className="text-left p-4 font-semibold">Role</th>
                                <th className="text-left p-4 font-semibold">Status</th>
                                <th className="text-right p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-20" /></td>
                                        <td className="p-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.map((u) => (
                                <tr key={u.id} className={`border-b transition-colors ${u.status === 'BANNED' ? 'bg-red-500/10 hover:bg-red-500/20' : 'hover:bg-muted/30'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={u.avatar} className="w-8 h-8 rounded-full border" alt="" />
                                            <div>
                                                <p className="font-medium text-foreground">{u.name}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="capitalize">
                                            {u.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={u.status === "ACTIVE" || !u.status ? "secondary" : "destructive"}>
                                            {u.status === "BANNED" ? "Banlı" : (u.status || "Aktif")}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                title="Activate User"
                                                onClick={() => handleActivate(u.id)}
                                                disabled={u.status === 'ACTIVE'}
                                            >
                                                <UserCheck className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:bg-destructive/10"
                                                title="Ban User"
                                                onClick={() => handleBan(u.id)}
                                                disabled={u.status === 'BANNED'}
                                            >
                                                <UserX className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
