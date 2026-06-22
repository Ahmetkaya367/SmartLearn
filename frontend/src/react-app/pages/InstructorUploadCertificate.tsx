import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { ArrowLeft, Loader2, Award, FileCheck, FileText } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function InstructorUploadCertificate() {
    const { enrollmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [certCode, setCertCode] = useState("");

    useEffect(() => {
        const fetchEnrollment = async () => {
            if (!enrollmentId) return;
            try {
                const data = await apiService.getEnrollmentById(enrollmentId);
                const [user, course] = await Promise.all([
                    apiService.getUserProfile(data.userId),
                    apiService.getCourseById(data.courseId)
                ]);
                setEnrollment({ ...data, studentName: user.fullName, courseTitle: course.title, instructorName: course.instructor });
                
                // Generate a random certificate code for the preview
                const code = "LRN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
                setCertCode(code);
            } catch (err) {
                console.error("Failed to fetch enrollment", err);
                toast.error("Kayıt bilgileri alınamadı.");
            } finally {
                setLoading(false);
            }
        };
        fetchEnrollment();
    }, [enrollmentId]);

    const toEnglishChars = (text: string) => {
        if (!text) return "";
        return text.replace(/Ğ/g, 'G')
            .replace(/ğ/g, 'g')
            .replace(/Ü/g, 'U')
            .replace(/ü/g, 'u')
            .replace(/Ş/g, 'S')
            .replace(/ş/g, 's')
            .replace(/İ/g, 'I')
            .replace(/ı/g, 'i')
            .replace(/Ö/g, 'O')
            .replace(/ö/g, 'o')
            .replace(/Ç/g, 'C')
            .replace(/ç/g, 'c');
    };

    const generateAndUploadPDF = async () => {
        if (!enrollment || !enrollmentId) return;
        setUploading(true);
        
        try {
            // Create PDF
            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

            // Add background/border
            doc.setDrawColor(20, 83, 45); // Dark green border
            doc.setLineWidth(5);
            doc.rect(10, 10, 277, 190);
            
            doc.setDrawColor(200, 162, 54); // Gold inner border
            doc.setLineWidth(1);
            doc.rect(15, 15, 267, 180);

            // Title
            doc.setFont("helvetica", "bold");
            doc.setTextColor(20, 83, 45);
            doc.setFontSize(30);
            doc.text("LEARNIFY AKADEMI KURS", 148.5, 45, { align: "center" });
            
            doc.setFontSize(24);
            doc.setTextColor(200, 162, 54);
            doc.text("BASARI SERTIFIKASI", 148.5, 60, { align: "center" });

            // Body text
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(14);
            doc.text("Bu belge,", 148.5, 80, { align: "center" });

            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text(toEnglishChars(enrollment.studentName).toUpperCase(), 148.5, 95, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            doc.text("adli ogrencinin Learnify Akademi bunyesinde duzenlenen;", 148.5, 110, { align: "center" });

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(20, 83, 45);
            doc.text(toEnglishChars(enrollment.courseTitle).toUpperCase(), 148.5, 125, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(14);
            doc.text("adli kursu tum gereksinimleriyle birlikte basariyla tamamladigini,", 148.5, 140, { align: "center" });
            doc.text("%100 bicimde kursu bitirerek bu sertifikayi almaya hak kazandigini resmi olarak onaylar.", 148.5, 150, { align: "center" });

            // Footer details
            const today = new Date().toLocaleDateString('tr-TR');
            
            doc.setFontSize(12);
            doc.text(`Egitmen: ${toEnglishChars(enrollment.instructorName)}`, 40, 175);
            doc.text(`Tamamlanma Tarihi: ${today}`, 190, 175);
            
            doc.setFont("helvetica", "bold");
            doc.setTextColor(100, 100, 100);
            doc.text(`Sertifika No: ${certCode}`, 148.5, 185, { align: "center" });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Bu sertifika, Learnify Akademi dijital sertifika dogrulama sistemi uzerinden`, 148.5, 192, { align: "center" });
            doc.setTextColor(0, 0, 255);
            doc.text(`http://localhost:5173/verify/${certCode}`, 148.5, 198, { align: "center" });

            // Convert PDF to Blob -> File
            const pdfBlob = doc.output("blob");
            const file = new File([pdfBlob], `certificate_${certCode}.pdf`, { type: "application/pdf" });

            // Upload via API
            await apiService.uploadCertificate(enrollmentId, file, certCode);
            
            toast.success("Sertifika başarıyla oluşturuldu ve yüklendi.");
            navigate("/instructor/students");
        } catch (err) {
            console.error("Certificate generation failed", err);
            toast.error("Sertifika oluşturulurken bir hata oluştu.");
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

    const today = new Date().toLocaleDateString('tr-TR');

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate("/instructor/students")} className="gap-2 -ml-4">
                <ArrowLeft className="w-4 h-4" /> Öğrenci Listesine Dön
            </Button>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                    {enrollment.certificateUrl ? "Sertifikayı Güncelle" : "Sertifika Oluştur"}
                </h1>
                <p className="text-muted-foreground">
                    Aşağıdaki şablon kullanılarak otomatik PDF oluşturulacak ve sisteme yüklenecektir.
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

            <Card className="p-10 border-2 border-primary/20 bg-white">
                <div className="text-center space-y-8 p-10 border-4 border-double border-primary/30 relative">
                    {/* Watermark / Logo placeholder */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                        <Award className="w-96 h-96" />
                    </div>

                    <div className="space-y-2 relative z-10">
                        <h2 className="text-3xl font-bold tracking-widest text-primary">LEARNIFY AKADEMİ KURS</h2>
                        <h3 className="text-2xl font-serif text-amber-600">BAŞARI SERTİFİKASI</h3>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <p className="text-lg text-muted-foreground">Bu belge,</p>
                        <p className="text-3xl font-bold font-serif">{enrollment.studentName}</p>
                        <p className="text-lg text-muted-foreground">adlı öğrencinin Learnify Akademi bünyesinde düzenlenen;</p>
                        <p className="text-2xl font-bold text-primary">{enrollment.courseTitle}</p>
                        <p className="text-lg text-muted-foreground">
                            adlı kursu tüm gereksinimleriyle birlikte başarıyla tamamladığını,<br/>
                            %100 biçimde kursu bitirerek bu sertifikayı almaya hak kazandığını resmi olarak onaylar.
                        </p>
                    </div>

                    <div className="flex justify-between items-end pt-12 relative z-10">
                        <div className="text-left">
                            <p className="font-semibold text-lg">Eğitmen: {enrollment.instructorName}</p>
                            <div className="w-48 h-px bg-border mt-2 mb-1"></div>
                            <p className="text-sm text-muted-foreground">İmza</p>
                        </div>
                        
                        <div className="text-right">
                            <p className="font-semibold text-lg">Tamamlanma Tarihi: {today}</p>
                            <div className="w-48 h-px bg-border mt-2 mb-1 ml-auto"></div>
                            <p className="text-sm text-muted-foreground">Tarih</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-muted mt-8 text-sm text-muted-foreground relative z-10">
                        <p>Sertifika No: <span className="font-mono font-bold text-foreground">{certCode}</span></p>
                        <p className="mt-1">
                            Bu sertifika, Learnify Akademi dijital sertifika doğrulama sistemi üzerinden<br/>
                            <a href={`http://localhost:5173/verify/${certCode}`} className="text-blue-600 underline">http://localhost:5173/verify/{certCode}</a><br/>
                            adresinden doğrulanabilir.
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate("/instructor/students")}>
                    İptal
                </Button>
                <Button 
                    className="gap-2" 
                    disabled={uploading} 
                    onClick={generateAndUploadPDF}
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                    Sertifikayı Onayla ve Yükle
                </Button>
            </div>
        </div>
    );
}
