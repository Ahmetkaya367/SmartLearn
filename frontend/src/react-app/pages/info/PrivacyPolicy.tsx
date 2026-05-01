import { Card } from "@/react-app/components/ui/card";
import { Shield, Lock, Eye, Users } from "lucide-react";
import { Separator } from "@/react-app/components/ui/separator";

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Gizlilik Politikası ve Veri Güvenliği</h1>
            <p className="text-muted-foreground mb-8">Son güncelleme: 19 Nisan 2026</p>

            <Card className="p-8 space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5 text-primary" /> Toplanan Veriler
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        SmartLearn olarak kayıt sırasında verdiğiniz isim, e-posta adresi ve profil sayfanızda paylaştığınız bilgiler (fotoğraf, biyografi) tarafımızca toplanmaktadır.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-primary" /> Veri Kullanımı
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Toplanan veriler sadece eğitim sürecinizi takip etmek, hesabınızı doğrulamak ve platform deneyiminizi iyileştirmek için kullanılır.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-primary" /> Güvenlik
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Şifreleriniz modern şifreleme yöntemleri (BCrypt) ile saklanır ve çalışanlarımız dahil hiç kimse tarafından düz metin olarak görülemez. Verilerinizin güvenliği bizim önceliğimizdir.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-primary" /> Üçüncü Şahıslar
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Verileriniz asla reklam şirketlerine veya üçüncü şahıslara satılmaz. SmartLearn, kullanıcı gizliliğini her şeyin üzerinde tutar.
                    </p>
                </section>
            </Card>
        </div>
    );
}
