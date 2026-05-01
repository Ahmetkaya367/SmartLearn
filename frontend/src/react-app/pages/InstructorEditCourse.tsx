import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Badge } from "@/react-app/components/ui/badge";
import { Save, Upload, Plus, Trash, PlayCircle, Loader2, Video } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function InstructorEditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    const [courseData, setCourseData] = useState<any>({
        title: "",
        description: "",
        category: "",
        level: "",
        price: 0,
        thumbnail: "",
        videoPreviewUrl: "",
        longDescription: "",
        sections: []
    });
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        apiService.getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;
            try {
                const data = await apiService.getCourseById(id);
                const d: any = data;
                setCourseData({
                    ...d,
                    category: (d.category || "").trim(),
                    level: (d.level || "").trim(),
                });
            } catch (err) {
                console.error("Failed to fetch course", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await apiService.updateCourse(id, courseData);
            alert("Kurs başarıyla güncellendi.");
            navigate("/instructor/my-courses");
        } catch (error) {
            console.error("Failed to update course", error);
            alert("Kurs güncellenirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const res = await apiService.uploadMedia(file);
            setCourseData((prev: any) => ({ ...prev, thumbnail: res.url }));
        } catch (err) {
            console.error("Image upload failed", err);
            alert("Resim yüklenemedi.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingVideo(true);
        try {
            const res = await apiService.uploadMedia(file);
            setCourseData((prev: any) => ({ ...prev, videoPreviewUrl: res.url }));
        } catch (err) {
            console.error("Video upload failed", err);
            alert("Tanıtım videosu yüklenemedi.");
        } finally {
            setUploadingVideo(false);
        }
    };

    const addSection = () => {
        setCourseData((prev: any) => ({
            ...prev,
            sections: [
                ...prev.sections,
                { id: crypto.randomUUID(), title: "Yeni Bölüm", orderIndex: prev.sections.length, lessons: [] }
            ]
        }));
    };

    const updateSectionTitle = (index: number, newTitle: string) => {
        const newSections = [...courseData.sections];
        newSections[index].title = newTitle;
        setCourseData({ ...courseData, sections: newSections });
    };

    const removeSection = (index: number) => {
        const newSections = [...courseData.sections];
        newSections.splice(index, 1);
        setCourseData({ ...courseData, sections: newSections });
    };

    const addLesson = (sectionIndex: number) => {
        const newSections = [...courseData.sections];
        newSections[sectionIndex].lessons.push({
            id: crypto.randomUUID(),
            title: "Yeni Ders",
            videoUrl: "",
            duration: "0:00",
            durationSeconds: 0,
            type: "video",
            orderIndex: newSections[sectionIndex].lessons.length,
            isPreview: false
        });
        setCourseData({ ...courseData, sections: newSections });
    };

    const updateLesson = (sectionIndex: number, lessonIndex: number, field: string, value: any) => {
         const newSections = [...courseData.sections];
         newSections[sectionIndex].lessons[lessonIndex] = {
             ...newSections[sectionIndex].lessons[lessonIndex],
             [field]: value
         };
         setCourseData({ ...courseData, sections: newSections });
    };

    const handleLessonVideoUpload = async (sectionIndex: number, lessonIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            // Get actual video duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const totalSeconds = Math.round(video.duration);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                const newSections = [...courseData.sections];
                newSections[sectionIndex].lessons[lessonIndex] = {
                    ...newSections[sectionIndex].lessons[lessonIndex],
                    duration: formattedDuration,
                    durationSeconds: totalSeconds
                };
                setCourseData({ ...courseData, sections: newSections });
            };
            video.src = URL.createObjectURL(file);
            
            const res = await apiService.uploadMedia(file);
            updateLesson(sectionIndex, lessonIndex, "videoUrl", res.url);
        } catch (err) {
            console.error("Lesson video upload failed", err);
            alert("Ders videosu yüklenemedi.");
        }
    };

    const removeLesson = (sectionIndex: number, lessonIndex: number) => {
         const newSections = [...courseData.sections];
         newSections[sectionIndex].lessons.splice(lessonIndex, 1);
         setCourseData({ ...courseData, sections: newSections });
    };

    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="p-8 space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Kurs Düzenle: {courseData.title}</h1>
                    <p className="text-muted-foreground">Kurs bilgilerinizi, medya dosyalarınızı ve müfredatınızı güncelleyin.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/instructor/my-courses")}>İptal</Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Temel Bilgiler</TabsTrigger>
                    <TabsTrigger value="media">Medya (Görsel & Video)</TabsTrigger>
                    <TabsTrigger value="curriculum">Müfredat</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                    <Card className="p-6 space-y-6 mt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Kurs Başlığı</Label>
                                <Input id="title" value={courseData.title || ""} onChange={(e) => setCourseData({...courseData, title: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Kısa Açıklama</Label>
                                <Textarea id="desc" value={courseData.description || ""} onChange={(e) => setCourseData({...courseData, description: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select value={courseData.category} onValueChange={(val) => setCourseData({...courseData, category: val})}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex justify-between">
                                    Seviye 
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                        (Mevcut: {courseData.level || "Yok"})
                                    </span>
                                </Label>
                                <Select 
                                    key={id + (courseData.level || "loading")}
                                    value={courseData.level || undefined} 
                                    onValueChange={(val) => setCourseData({...courseData, level: val})}
                                >
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
                                <Input id="price" type="number" value={courseData.price || 0} onChange={(e) => setCourseData({...courseData, price: parseFloat(e.target.value)})} />
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="media">
                    <Card className="p-6 space-y-6 mt-4">
                        <div className="space-y-2">
                            <Label>Kurs Görseli</Label>
                            {courseData.thumbnail && courseData.thumbnail.trim() !== "" && (
                                <div className="mb-4">
                                    <img src={courseData.thumbnail} alt="Thumbnail preview" className="w-64 h-36 object-cover rounded-lg border" />
                                </div>
                            )}
                            <div className="relative border-2 border-dashed rounded-lg p-12 text-center space-y-4 hover:border-primary/50 transition-colors">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-medium">Görsel yüklemek için tıklayın veya sürükleyin</p>
                                    <p className="text-sm text-muted-foreground">Önerilen boyut: 1280x720px</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-6 border-t">
                            <Label>Tanıtım Videosu</Label>
                            {courseData.videoPreviewUrl && courseData.videoPreviewUrl.trim() !== "" && (
                                <div className="mb-4">
                                    <video src={courseData.videoPreviewUrl} controls className="w-80 h-45 object-cover rounded-lg border bg-black" />
                                </div>
                            )}
                            <div className="relative border-2 border-dashed rounded-lg p-12 text-center space-y-4 hover:border-primary/50 transition-colors">
                                <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    {uploadingVideo ? <Loader2 className="w-6 h-6 animate-spin" /> : <PlayCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-medium">Tanıtım videosu yüklemek için tıklayın</p>
                                    <p className="text-sm text-muted-foreground">Sadece MP4 formatında</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="curriculum">
                    <Card className="p-6 space-y-6 mt-4 bg-muted/20">
                        {courseData.sections?.map((section: any, sIdx: number) => (
                            <div key={section.id || sIdx} className="bg-background rounded-xl p-5 border shadow-sm space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-muted-foreground">Bölüm {sIdx + 1}:</span>
                                    <Input 
                                        className="flex-1 font-semibold"
                                        value={section.title} 
                                        onChange={(e) => updateSectionTitle(sIdx, e.target.value)} 
                                        placeholder="Bölüm Başlığı"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => removeSection(sIdx)} className="text-destructive">
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="pl-8 space-y-3">
                                    {section.lessons?.map((lesson: any, lIdx: number) => (
                                        <div key={lesson.id || lIdx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                                            <span className="text-sm text-muted-foreground">{lIdx + 1}.</span>
                                            <Input 
                                                className="flex-1 text-sm bg-background h-8"
                                                value={lesson.title} 
                                                onChange={(e) => updateLesson(sIdx, lIdx, "title", e.target.value)} 
                                                placeholder="Ders Başlığı" 
                                            />
                                            {lesson.videoUrl ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1"><Video className="w-3 h-3"/> Yüklendi</Badge>
                                            ) : (
                                                <div className="relative group overflow-hidden">
                                                    <input type="file" accept="video/mp4,video/webm" onChange={(e) => handleLessonVideoUpload(sIdx, lIdx, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                                    <Button variant="secondary" size="sm" className="h-8 gap-1"><Upload className="w-3 h-3" /> Video Yükle</Button>
                                                </div>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLesson(sIdx, lIdx)}>
                                                <Trash className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="gap-2 w-full border-dashed" onClick={() => addLesson(sIdx)}>
                                        <Plus className="w-4 h-4" /> Yeni Ders Ekle
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button variant="secondary" className="gap-2 w-full p-6 text-base" onClick={addSection}>
                            <Plus className="w-5 h-5" /> Yeni Bölüm Ekle
                        </Button>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
