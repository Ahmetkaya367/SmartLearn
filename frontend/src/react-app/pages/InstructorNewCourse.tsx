import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/react-app/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function InstructorNewCourse() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        category: "",
        level: "Başlangıç",
        price: 0
    });
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        apiService.getCategories().then(setCategories);
    }, []);

    const handleContinue = async () => {
        if (!courseData.title.trim()) {
            alert("Lütfen kurs başlığını girin.");
            return;
        }

        setLoading(true);
        try {
            // Backend CreateCourseRequest modeline uygun veriyi gönderiyoruz
            // İçermediğimiz status gibi ekstra property'ler 400 hatasına sebep olabilir
            const requestPayload = {
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                level: courseData.level,
                price: courseData.price,
                thumbnail: ""
            };
            const newCourse = await apiService.createCourse(requestPayload);
            // Varsayılan olarak courses/:id/edit rotasına yönlendir
            navigate(`/instructor/courses/${newCourse.id}/edit`);
        } catch (error) {
            console.error("Kurs oluşturulamadı", error);
            alert("Kurs oluşturulurken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Yeni Kurs Oluştur</h1>
                <p className="text-muted-foreground">Bilginizi dünyayla paylaşmaya başlayın.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Kurs Başlığı</Label>
                            <Input 
                                id="title" 
                                placeholder="Örn: Sıfırdan İleri Seviye React" 
                                value={courseData.title}
                                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Kısa Açıklama</Label>
                            <Textarea 
                                id="desc" 
                                placeholder="Öğrencilerin neden bu kursu alması gerektiğini açıklayın." 
                                value={courseData.description}
                                onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select value={courseData.category} onValueChange={(val) => setCourseData({...courseData, category: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Seviye</Label>
                            <Select value={courseData.level} onValueChange={(val) => setCourseData({...courseData, level: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                                    <SelectItem value="Orta">Orta</SelectItem>
                                    <SelectItem value="İleri">İleri</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Fiyat (₺)</Label>
                            <Input 
                                id="price" 
                                type="number" 
                                placeholder="0.00" 
                                value={courseData.price || ""}
                                onChange={(e) => setCourseData({...courseData, price: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t font-semibold">
                        <Button variant="ghost" onClick={() => navigate("/instructor/my-courses")}>İptal</Button>
                        <div className="flex gap-3">
                            <Button 
                                className="gap-2" 
                                onClick={handleContinue}
                                disabled={loading || !courseData.title || !courseData.category || !courseData.level}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Devam Et
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
