import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Badge } from "@/react-app/components/ui/badge";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function AdminCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await apiService.getAllCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await apiService.approveCourse(id);
            fetchCourses(); // refresh
        } catch (e) {
            console.error(e);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await apiService.rejectCourse(id);
            fetchCourses(); // refresh
        } catch (e) {
            console.error(e);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Kurs Yönetimi</h1>
                <p className="text-muted-foreground">Platformdaki kursları inceleyin, onaylayın veya yayından kaldırın.</p>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Kurs ara..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="p-4 flex gap-6">
                                <Skeleton className="w-48 h-28 rounded-lg" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                            </Card>
                        ))
                    ) : filteredCourses.map((c) => (
                        <Card key={c.id} className="p-4 flex flex-col md:flex-row gap-6 transition-colors hover:bg-muted/30">
                            <div className="w-full md:w-48 h-32 md:h-28 shrink-0 rounded-lg overflow-hidden border">
                                <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{c.title}</h3>
                                        {c.isBestseller && <Badge className="bg-amber-500">Bestseller</Badge>}
                                        {c.status === 'ARCHIVED' && <Badge variant="destructive">Reddedildi</Badge>}
                                        {c.status === 'PENDING_APPROVAL' && <Badge variant="secondary" className="bg-blue-500 text-white">Beklemede</Badge>}
                                        {c.status === 'PUBLISHED' && <Badge variant="secondary" className="bg-emerald-500 text-white">Yayında</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Eğitmen: <span className="font-medium text-foreground">{c.instructor}</span></p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Badge variant="outline">{c.category}</Badge>
                                        <span className="text-sm font-bold text-primary">${c.price}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Eye className="w-4 h-4" /> İncele
                                    </Button>
                                    {c.status !== 'PUBLISHED' && (
                                        <Button variant="outline" size="sm" className="gap-2 text-green-600 hover:text-green-700" onClick={() => handleApprove(c.id)}>
                                            <CheckCircle className="w-4 h-4" /> Onayla
                                        </Button>
                                    )}
                                    {c.status !== 'ARCHIVED' && (
                                        <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:bg-destructive/10" onClick={() => handleReject(c.id)}>
                                            <XCircle className="w-4 h-4" /> Reddet
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>
        </div>
    );
}
