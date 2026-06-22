import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Award, Download, Share2 } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function StudentCertificates() {
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const data = await apiService.getStudentCertificates();
                setCertificates(data);
            } catch (error) {
                console.error("Failed to fetch certificates:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Sertifikalarım</h1>
                <p className="text-muted-foreground">Tamamladığınız kursların başarı belgelerine buradan ulaşabilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
                ) : certificates.length > 0 ? (
                    certificates.map((cert) => (
                        <Card key={cert.id} className="p-6 border-l-4 border-l-primary flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{cert.courseTitle}</h3>
                                        <p className="text-sm text-muted-foreground">Verilme Tarihi: {cert.issueDate}</p>
                                    </div>
                                </div>
                                <div className="bg-muted/50 p-2 rounded text-xs font-medium inline-block">
                                    Başarı Notu: {cert.grade}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 gap-2"
                                    onClick={() => window.open(cert.certificateUrl, '_blank')}
                                >
                                    <Download className="w-4 h-4" /> İndir
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => window.open(`/verify/${cert.certificateCode}`, '_blank')}
                                >
                                    <Share2 className="w-4 h-4" /> Doğrula
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="md:col-span-2 p-12 text-center text-muted-foreground">
                        Henüz bir sertifikanız bulunmuyor. Kursları tamamlayarak sertifika kazanmaya başlayın.
                    </Card>
                )}
            </div>
        </div>
    );
}
