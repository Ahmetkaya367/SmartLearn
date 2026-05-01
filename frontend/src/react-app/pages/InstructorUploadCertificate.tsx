import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Label } from "@/react-app/components/ui/label";
import { FileText, Upload, ArrowLeft, CheckCircle, Loader2, Award } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { toast } from "sonner";

export default function InstructorUploadCertificate() {
    const { enrollmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchEnrollment = async () => {
            if (!enrollmentId) return;
            try {
                const data = await apiService.getEnrollmentById(enrollmentId);
                // Also fetch student and course info
                const [user, course] = await Promise.all([
                    apiService.getUserProfile(data.userId),
                    apiService.getCourseById(data.courseId)
                ]);
                setEnrollment({ ...data, studentName: user.fullName, courseTitle: course.title });
            } catch (err) {
                console.error("Failed to fetch enrollment", err);
                toast.error("Kayıt bilgileri alınamadı.");
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollment();
    }, [enrollmentId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else {
            toast.error("Lütfen geçerli bir PDF dosyası seçin.");
            e.target.value = "";
        }
    };

    const handleUpload = async () => {
        if (!file || !enrollmentId) return;
        setUploading(true);
        try {
            await apiService.uploadCertificate(enrollmentId, file);
            toast.success("Sertifika başarıyla yüklendi.");
            navigate("/instructor/students");
        } catch (err) {
            console.error("Upload failed", err);
            toast.error("Yükleme sırasında bir hata oluştu.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!enrollment) return <div className="p-8">Kayıt bulunamadı.</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate("/instructor/students")} className="gap-2 -ml-4">
                <ArrowLeft className="w-4 h-4" /> Öğrenci Listesine Dön
            </Button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    {enrollment.certificateUrl ? "Sertifikayı Güncelle" : "Sertifika Yükle"}
                </h1>
                <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{enrollment.studentName}</span> isimli öğrenci için 
                    <span className="font-semibold text-foreground"> {enrollment.courseTitle}</span> kursu sertifikasını PDF olarak yükleyin.
                </p>
                {enrollment.certificateUrl && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Mevcut bir sertifika yüklü: </span>
                        <a href={enrollment.certificateUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-900">
                            Görüntüle
                        </a>
                    </div>
                )}
            </div>

            <Card className="p-8 space-y-6">
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Sertifika Dosyası (PDF)</Label>
                    <div className="relative border-2 border-dashed rounded-xl p-12 text-center space-y-4 hover:border-primary/50 transition-colors bg-muted/20">
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {file ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <FileText className="w-8 h-8" />}
                        </div>
                        <div>
                            {file ? (
                                <p className="font-medium text-emerald-600">{file.name}</p>
                            ) : (
                                <>
                                    <p className="font-medium">
                                        {enrollment.certificateUrl ? "Yeni bir PDF seçerek mevcut olanı değiştirin" : "PDF dosyasını seçmek için tıklayın veya sürükleyin"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Maksimum dosya boyutu: 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => navigate("/instructor/students")}>
                        İptal
                    </Button>
                    <Button 
                        className="flex-1 gap-2" 
                        disabled={!file || uploading} 
                        onClick={handleUpload}
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {enrollment.certificateUrl ? "Sertifikayı Güncelle" : "Sertifikayı Yayınla"}
                    </Button>
                </div>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                <Award className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                    <strong>Dikkat:</strong> Yüklediğiniz sertifika anında öğrencinin "Sertifikalarım" bölümünde görünür olacaktır. 
                    Lütfen dosyanın doğru öğrenci ve kurs için olduğundan emin olun.
                </p>
            </div>
        </div>
    );
}
