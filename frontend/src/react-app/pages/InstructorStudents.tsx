import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import { Search, Award, BookOpen, Upload } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { useAuthStore } from "@/react-app/store/useAuthStore";

export default function InstructorStudents() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [displayData, setDisplayData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                const [allCourses, enrollments] = await Promise.all([
                    apiService.getCourses(),
                    apiService.getInstructorStudents(user.id)
                ]);

                // One row per enrollment (course+student pair)
                const rows = enrollments.map((enrollment: any) => {
                    const course = allCourses.find((c: any) => c.id === enrollment.courseId);
                    return {
                        key: `${enrollment.userId}-${enrollment.courseId}`,
                        enrollmentId: enrollment.id,
                        studentName: enrollment.studentName && enrollment.studentName !== "Unknown Student"
                            ? enrollment.studentName
                            : "Öğrenci " + String(enrollment.userId).substring(0, 6),
                        courseTitle: course ? course.title : `Kurs (${String(enrollment.courseId).substring(0, 8)})`,
                        progress: parseInt(enrollment.progressPercent) || 0,
                        lastAccessed: enrollment.lastAccessedAt,
                        userId: enrollment.userId,
                        hasCertificate: enrollment.certificateUrl ? true : false
                    };
                });

                // Sort: 100% progress first, then alphabetically
                const sortedRows = rows.sort((a: any, b: any) => {
                    if (a.progress === 100 && b.progress !== 100) return -1;
                    if (a.progress !== 100 && b.progress === 100) return 1;
                    return a.studentName.localeCompare(b.studentName);
                });

                setDisplayData(sortedRows);
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

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return "bg-emerald-500";
        if (progress >= 80) return "bg-emerald-400";
        if (progress >= 40) return "bg-amber-500";
        return "bg-blue-500";
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Öğrenci Listesi</h1>
                <p className="text-muted-foreground">Kurslarınıza kayıtlı öğrencileri ve her kursa göre ilerlemelerini görün.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{displayData.length}</p>
                        <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
                    </div>
                </Card>
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">
                            {new Set(displayData.map(d => d.userId)).size}
                        </p>
                        <p className="text-sm text-muted-foreground">Benzersiz Öğrenci</p>
                    </div>
                </Card>
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
                                <th className="text-left p-4 font-semibold text-foreground w-48">İlerleme</th>
                                <th className="text-right p-4 font-semibold text-foreground">Sertifika</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-4"><Skeleton className="h-10 w-40" /></td>
                                        <td className="p-4"><Skeleton className="h-6 w-48" /></td>
                                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                        <td className="p-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.key} className="transition-colors hover:bg-muted/30">
                                        <td className="p-4 font-medium text-foreground">{item.studentName}</td>
                                        <td className="p-4 text-muted-foreground text-sm">{item.courseTitle}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className={`${getProgressColor(item.progress)} h-full transition-all duration-500`}
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[11px] min-w-[44px] justify-center ${
                                                        item.progress >= 100 ? "bg-emerald-500 text-white border-emerald-500" :
                                                        item.progress >= 80 ? "text-emerald-600 border-emerald-300" :
                                                        item.progress >= 40 ? "text-amber-600 border-amber-300" :
                                                        "text-blue-600 border-blue-300"
                                                    }`}
                                                >
                                                    {item.progress}%
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            {item.progress >= 100 ? (
                                                <Button 
                                                    size="sm" 
                                                    variant={item.hasCertificate ? "outline" : "default"}
                                                    className="gap-2"
                                                    onClick={() => navigate(`/instructor/students/${item.enrollmentId}/upload-certificate`)}
                                                >
                                                    {item.hasCertificate ? <Award className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                                    {item.hasCertificate ? "Güncelle" : "Sertifika Yükle"}
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Tamamlanmadı</span>
                                            )}
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
