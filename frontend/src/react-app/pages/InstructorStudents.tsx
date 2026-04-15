import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Search, Mail } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { useAuthStore } from "@/react-app/store/useAuthStore";

export default function InstructorStudents() {
    const { user } = useAuthStore();
    const [displayData, setDisplayData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [allUsers, allCourses, enrollments] = await Promise.all([
                    apiService.getAdminUsers(),
                    apiService.getCourses(),
                    apiService.getInstructorStudents(user.id)
                ]);

                const joinedData = enrollments.map((enrollment: any) => {
                    const student = allUsers.find((u: any) => u.id === enrollment.userId);
                    const course = allCourses.find((c: any) => c.id === enrollment.courseId);
                    
                    return {
                        id: enrollment.id,
                        studentName: student ? student.name : "Unknown Student",
                        courseTitle: course ? course.title : "Unknown Course",
                        progress: enrollment.progressPercent || 0,
                        lastAccessed: enrollment.lastAccessedAt
                    };
                });

                setDisplayData(joinedData);
            } catch (error) {
                console.error("Failed to fetch instructor students data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    const filteredData = displayData.filter(item => 
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Öğrenci Listesi</h1>
                <p className="text-muted-foreground">Kurslarınıza kayıtlı öğrencileri ve ilerlemelerini görün.</p>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Öğrenci veya kurs ara..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-foreground">Öğrenci</th>
                                <th className="text-left p-4 font-semibold text-foreground">Kayıtlı Kurs</th>
                                <th className="text-left p-4 font-semibold text-foreground">İlerleme</th>
                                <th className="text-right p-4 font-semibold text-foreground">İletişim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-48" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                                        <td className="p-4 font-medium text-foreground">{item.studentName}</td>
                                        <td className="p-4 text-muted-foreground">{item.courseTitle}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 bg-secondary h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-primary h-full transition-all duration-500" 
                                                        style={{ width: `${item.progress}%` }} 
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">{item.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-primary hover:text-primary/80 transition-colors p-2 hover:bg-primary/10 rounded-full">
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                        Eşleşen öğrenci bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
