import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Separator } from "@/react-app/components/ui/separator";

export default function AdminSettings() {
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
                            <div className="space-y-2">
                                <Label htmlFor="siteName">Site Adı</Label>
                                <Input id="siteName" defaultValue="Learnify" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supportEmail">Destek E-postası</Label>
                                <Input id="supportEmail" defaultValue="support@learnify.com" />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Eğitmen Politikası</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Eğitmen Başvurularını Otomatik Onayla</p>
                                    <p className="text-sm text-muted-foreground">Yeni başvurular manuel inceleme gerektirmeden onaylanır.</p>
                                </div>
                                <Button variant="outline">Pasif</Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Platform Komisyonu (%)</p>
                                    <p className="text-sm text-muted-foreground">Kurs satışlarından alınacak standart platform payı.</p>
                                </div>
                                <div className="w-24">
                                    <Input type="number" defaultValue="15" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button className="px-8">Değişiklikleri Kaydet</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
