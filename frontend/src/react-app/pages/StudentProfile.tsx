import { useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { useAuthStore } from "@/react-app/store/useAuthStore";
import { User, Camera, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function StudentProfile() {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // States for profile info
    const [fullName, setFullName] = useState(user?.name || "");
    
    // States for password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSaveProfile = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            await apiService.updateUserProfile(user.id, {
                fullName: fullName,
                avatarUrl: user.avatar
            });
            updateUser({ name: fullName });
            alert("Profil başarıyla güncellendi.");
        } catch (err: any) {
            alert(err.message || "Profil güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        setUploading(true);
        try {
            const uploadRes = await apiService.uploadMedia(file);
            await apiService.updateUserProfile(user.id, {
                fullName: fullName,
                avatarUrl: uploadRes.url
            });
            updateUser({ avatar: uploadRes.url });
            alert("Profil fotoğrafı güncellendi.");
        } catch (err: any) {
            alert(err.message || "Fotoğraf yüklenemedi.");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!user?.id) return;
        if (newPassword !== confirmPassword) {
            alert("Yeni şifreler eşleşmiyor.");
            return;
        }
        if (newPassword.length < 6) {
            alert("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setPassLoading(true);
        try {
            await apiService.changePassword(user.id, currentPassword, newPassword);
            alert("Şifreniz başarıyla değiştirildi.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            alert(err.message || "Şifre güncellenemedi.");
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Profil Ayarları</h1>
                <p className="text-muted-foreground">Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin.</p>
            </div>

            <div className="space-y-8">
                <Card className="p-6 transition-all duration-300 hover:shadow-md">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" /> Kişisel Bilgiler
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="shrink-0 space-y-4">
                            <div className="relative group">
                                <img
                                    src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-muted group-hover:opacity-80 transition-all duration-300 shadow-sm"
                                />
                                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/20 rounded-full">
                                    <Camera className="w-8 h-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                </label>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" size="sm" className="w-full relative overflow-hidden group">
                                <span className="relative z-10">Fotoğraf Değiştir</span>
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                            </Button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tam Ad</Label>
                                <Input 
                                    id="name" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    placeholder="Adınız Soyadınız"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" defaultValue={user?.email} disabled className="bg-muted/50 cursor-not-allowed" />
                                <p className="text-[10px] text-muted-foreground">E-posta adresi değiştirilemez.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleSaveProfile} disabled={loading} className="gap-2 min-w-[120px]">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Kaydet
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 transition-all duration-300 hover:shadow-md">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" /> Şifre Güncelleme
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="currPass">Mevcut Şifre</Label>
                            <Input 
                                id="currPass" 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPass">Yeni Şifre</Label>
                            <Input 
                                id="newPass" 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confPass">Yeni Şifre (Tekrar)</Label>
                            <Input 
                                id="confPass" 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleUpdatePassword} disabled={passLoading} className="gap-2">
                            {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            Şifreyi Güncelle
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
