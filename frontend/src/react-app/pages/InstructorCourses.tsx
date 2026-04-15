import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Badge } from "@/react-app/components/ui/badge";
import { Plus, Pencil, Users, Star, MoreVertical } from "lucide-react";
import { Link } from "react-router";
import { apiService } from "@/react-app/lib/apiService";

export default function InstructorCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructorCourses = async () => {
            try {
                const instructorCourses = await apiService.getInstructorCourses();
                setCourses(instructorCourses);
            } catch (error) {
                console.error("Failed to fetch instructor courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInstructorCourses();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kurslarım</h1>
                    <p className="text-muted-foreground">Oluşturduğunuz ve yönettiğiniz tüm kurslar burada listelenir.</p>
                </div>
                <Button className="gap-2" asChild>
                    <Link to="/instructor/new">
                        <Plus className="w-4 h-4" /> Yeni Kurs Oluştur
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </Card>
                    ))
                ) : courses.map((c) => (
                    <Card key={c.id} className="overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="aspect-video relative overflow-hidden">
                            <img src={c.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 right-2">
                                {c.status === 'ARCHIVED' && <Badge variant="destructive">Yayından Kaldırıldı</Badge>}
                                {c.status === 'PENDING_APPROVAL' && <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">Beklemede</Badge>}
                                {(c.status === 'PUBLISHED' || !c.status) && <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Yayında</Badge>}
                                {c.status === 'DRAFT' && <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">Taslak</Badge>}
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <h3 className="font-bold text-lg leading-tight line-clamp-2">{c.title}</h3>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{c.studentCount} students</span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-semibold">{c.rating}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="flex-1 gap-2" asChild>
                                    <Link to={`/instructor/courses/${c.id}/edit`}>
                                        <Pencil className="w-4 h-4" /> Düzenle
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
