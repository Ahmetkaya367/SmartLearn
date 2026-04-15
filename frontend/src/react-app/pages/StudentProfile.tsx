import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Separator } from "@/react-app/components/ui/separator";
import { useAuthStore } from "@/react-app/store/useAuthStore";
import { User, Camera, Lock } from "lucide-react";

export default function StudentProfile() {
    const { user } = useAuthStore();

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Profil Ayarları</h1>
                <p className="text-muted-foreground">Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin.</p>
            </div>

            <div className="space-y-8">
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Kişisel Bilgiler
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="shrink-0 space-y-4">
                            <div className="relative group">
                                <img
                                    src={user?.avatar}
                                    alt=""
                                    className="w-32 h-32 rounded-full object-cover border-4 border-muted group-hover:opacity-80 transition-opacity"
                                />
                                <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </button>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">Fotoğraf Değiştir</Button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tam Ad</Label>
                                <Input id="name" defaultValue={user?.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" defaultValue={user?.email} disabled />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" /> Şifre Güncelleme
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="currPass">Mevcut Şifre</Label>
                            <Input id="currPass" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPass">Yeni Şifre</Label>
                            <Input id="newPass" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confPass">Yeni Şifre (Tekrar)</Label>
                            <Input id="confPass" type="password" />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button>Şifreyi Güncelle</Button>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost">İptal</Button>
                    <Button className="px-8">Kaydet</Button>
                </div>
            </div>
        </div>
    );
}
