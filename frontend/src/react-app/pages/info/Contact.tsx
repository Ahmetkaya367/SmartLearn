import { useState, useEffect } from "react";
import { apiService } from "@/react-app/lib/apiService";
import { Card } from "@/react-app/components/ui/card";
import { Mail, MapPin, Clock, Phone } from "lucide-react";

export default function Contact() {
    const [supportEmail, setSupportEmail] = useState("destek@smartlearn.com");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await apiService.getSystemSettings();
                if (settings.support_email) {
                    setSupportEmail(settings.support_email);
                }
            } catch (err) {
                console.error("Failed to fetch support email", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-center">Bize Ulaşın</h1>
            <p className="text-muted-foreground mb-12 text-center">Sorularınız, önerileriniz veya teknik destek talepleriniz için aşağıdaki kanallar üzerinden bizimle iletişime geçebilirsiniz.</p>

            <Card className="p-8 space-y-8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">E-posta</h3>
                        <p className="text-muted-foreground">{supportEmail}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Adres</h3>
                        <p className="text-muted-foreground">SmartLearn Teknoloji Ofisi, İstanbul / Türkiye</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Çalışma Saatleri</h3>
                        <p className="text-muted-foreground">Hafta içi 09:00 - 18:00</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Telefon (Destek)</h3>
                        <p className="text-muted-foreground">+90 (212) 555 01 01</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
