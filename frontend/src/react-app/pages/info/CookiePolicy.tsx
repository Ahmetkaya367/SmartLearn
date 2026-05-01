import { Card } from "@/react-app/components/ui/card";
import { Cookie, Settings, BarChart, Bell } from "lucide-react";
import { Separator } from "@/react-app/components/ui/separator";

export default function CookiePolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Çerez Politikası</h1>
            <p className="text-muted-foreground mb-8">SmartLearn, size daha iyi ve kişiselleştirilmiş bir kullanıcı deneyimi sunmak için çerezleri (cookies) kullanır.</p>

            <Card className="p-8 space-y-8">
                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Cookie className="w-5 h-5 text-primary" /> Oturum Çerezleri
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Sitede giriş yapmış olarak kalmanızı sağlar (JWT Token yönetimi). Bu çerezler platformun temel fonksiyonlarının çalışması için zorunludur.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <BarChart className="w-5 h-5 text-primary" /> Performans Çerezleri
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Sitenin hangi bölümlerinin daha çok kullanıldığını ve olası teknik hataları analiz etmemize yardımcı olur. Bu sayede platformu sizin için sürekli geliştiriyoruz.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-primary" /> İşlevsel Çerezler
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Dil tercihleriniz veya kullanıcı ayarlarınız gibi tercihlerinizi hatırlamamızı sağlayarak size daha akıcı bir deneyim sunar.
                    </p>
                </section>

                <Separator />

                <section>
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Settings className="w-5 h-5 text-primary" /> Kontrolünüzde
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Tarayıcı ayarlarınızdan çerezleri her zaman reddedebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız durumunda platformun giriş yapma gibi bazı kritik fonksiyonları çalışmayabilir.
                    </p>
                </section>
            </Card>
        </div>
    );
}
