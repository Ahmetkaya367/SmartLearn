import { useState, useEffect } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Separator } from "@/react-app/components/ui/separator";
import { apiService } from "@/react-app/lib/apiService";
import { Loader2, Save } from "lucide-react";

export default function AdminSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [supportEmail, setSupportEmail] = useState("");
    const [platformCommission, setPlatformCommission] = useState("15");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await apiService.getSystemSettings();
                setSupportEmail(settings.support_email || "destek@smartlearn.com");
                setPlatformCommission(settings.platform_commission?.toString() || "15");
            } catch (err) {
                console.error("Settings fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiService.updateSystemSettings({
                support_email: supportEmail,
                platform_commission: platformCommission.toString()
            });
            alert("Ayarlar başarıyla kaydedildi.");
        } catch (err: any) {
            alert(err.message || "Ayarlar kaydedilemedi.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Sistem Ayarları</h1>
                <p className="text-muted-foreground">Platformun genel konfigürasyonunu ve güvenlik ayarlarını yönetin.</p>
            </div>

            <div className="space-y-6">
                <Card className="p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Genel Bilgiler</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Site Adı alanı kullanıcı isteği üzerine kaldırıldı */}
                            <div className="space-y-2">
                                <Label htmlFor="supportEmail">Destek E-postası</Label>
                                <Input 
                                    id="supportEmail" 
                                    value={supportEmail} 
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    placeholder="destek@smartlearn.com"
                                />
                                <p className="text-[10px] text-muted-foreground">Bu adres 'İletişim' sayfasında görünür.</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Eğitmen Politikası</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Platform Komisyonu (%)</p>
                                    <p className="text-sm text-muted-foreground">Kurs satışlarından alınacak standart platform payı.</p>
                                </div>
                                <div className="w-24">
                                    <Input type="number" value={platformCommission} onChange={e => setPlatformCommission(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={saving} className="px-8 gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Değişiklikleri Kaydet
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
