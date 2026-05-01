import { Card } from "@/react-app/components/ui/card";
import { FileText, UserCheck, AlertTriangle, CloudOff } from "lucide-react";
import { Separator } from "@/react-app/components/ui/separator";

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Kullanım Şartları ve Koşullar</h1>
            <p className="text-muted-foreground mb-8">SmartLearn platformunu kullanarak aşağıdaki kuralları kabul etmiş sayılırsınız.</p>

            <Card className="p-8 space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <UserCheck className="w-5 h-5 text-primary" /> Hesap Sorumluluğu
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Hesabınızın ve şifrenizin güvenliğinden siz sorumlusunuz. Şüpheli bir durumda veya hesap çalınma ihtimalinde derhal yönetime bildirim yapmalısınız.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-primary" /> İçerik Kullanımı
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Platformdaki kurs içerikleri, videolar ve dökümanlar yalnızca kişisel kullanım içindir. Bu içerikler ticari amaçla kopyalanamaz, paylaşılamaz veya çoğaltılamaz.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-primary" /> Etik Kurallar
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Forum ve yorum alanlarında diğer kullanıcılara karşı saygılı olunmalıdır. Hakaret, ayrımcılık veya kötüye kullanım, hesabın kalıcı olarak askıya alınma sebebidir.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <CloudOff className="w-5 h-5 text-primary" /> Hizmet Kesintisi
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Bakım çalışmaları ve teknik güncellemeler nedeniyle oluşabilecek geçici kesintilerden SmartLearn sorumlu tutulamaz. Kesintiler genellikle önceden bildirilir.
                    </p>
                </section>
            </Card>
        </div>
    );
}
