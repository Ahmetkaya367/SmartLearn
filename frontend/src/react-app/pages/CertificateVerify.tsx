import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Loader2, Award, CheckCircle, XCircle, Search } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { Input } from "@/react-app/components/ui/input";

export default function CertificateVerify() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [searchCode, setSearchCode] = useState(code || "");

    useEffect(() => {
        if (code) {
            verifyCode(code);
        } else {
            setLoading(false);
        }
    }, [code]);

    const verifyCode = async (certCode: string) => {
        setLoading(true);
        try {
            const result = await apiService.verifyCertificate(certCode);
            setVerificationResult(result);
        } catch (error) {
            setVerificationResult({ valid: false, message: "Sertifika bulunamadı veya geçersiz." });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchCode.trim()) {
            navigate(`/verify/${searchCode.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
                        <Award className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold">Sertifika Doğrulama Sistemi</h1>
                    <p className="text-muted-foreground">
                        Learnify Akademi tarafından verilen dijital sertifikaların orijinalliğini doğrulayın.
                    </p>
                </div>

                <Card className="p-6 shadow-md border-primary/10">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <Input
                            placeholder="Sertifika Kodunu Girin (örn: LRN-ABC123XY)"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="text-lg py-6"
                        />
                        <Button type="submit" size="lg" className="px-8 gap-2">
                            <Search className="w-5 h-5" /> Doğrula
                        </Button>
                    </form>
                </Card>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Sertifika kontrol ediliyor...</p>
                    </div>
                ) : verificationResult && (
                    <Card className={`overflow-hidden border-2 shadow-lg transition-all ${
                        verificationResult.valid ? 'border-emerald-500' : 'border-red-500'
                    }`}>
                        <div className={`p-6 text-white text-center ${
                            verificationResult.valid ? 'bg-emerald-500' : 'bg-red-500'
                        }`}>
                            {verificationResult.valid ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle className="w-16 h-16" />
                                    <h2 className="text-2xl font-bold">Geçerli Sertifika</h2>
                                    <p className="opacity-90">Bu sertifika Learnify Akademi tarafından onaylanmıştır.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <XCircle className="w-16 h-16" />
                                    <h2 className="text-2xl font-bold">Geçersiz Sertifika</h2>
                                    <p className="opacity-90">{verificationResult.message || "Bu kod ile eşleşen bir sertifika bulunamadı."}</p>
                                </div>
                            )}
                        </div>

                        {verificationResult.valid && (
                            <div className="p-8 space-y-6 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Öğrenci Adı Soyadı</p>
                                        <p className="text-xl font-bold text-foreground">{verificationResult.studentName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Kurs Adı</p>
                                        <p className="text-xl font-bold text-primary">{verificationResult.courseTitle}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Eğitmen</p>
                                        <p className="font-medium text-foreground">{verificationResult.instructorName}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Tamamlanma Tarihi</p>
                                        <p className="font-medium text-foreground">{verificationResult.issuedAt}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-sm text-muted-foreground">Sertifika Kodu</p>
                                        <p className="font-mono font-medium text-foreground bg-muted inline-block px-3 py-1 rounded">
                                            {verificationResult.certificateCode}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t flex justify-center">
                                    <Button onClick={() => window.open(verificationResult.certificateUrl, '_blank')} className="gap-2">
                                        Sertifika Belgesini Görüntüle
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
