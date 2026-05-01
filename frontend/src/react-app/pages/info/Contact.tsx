import { useState, useEffect } from "react";
import { apiService } from "@/react-app/lib/apiService";
import { Card } from "@/react-app/components/ui/card";
import { Mail, MapPin, Clock, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate sending process
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-32 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Mesajınız Alındı!</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Bizimle iletişime geçtiğiniz için teşekkürler. Ekibimiz en kısa sürede size geri dönüş yapacaktır.
                </p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all"
                >
                    Yeni Mesaj Gönder
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Bize Ulaşın</h1>
            <p className="text-muted-foreground mb-12">Sorularınız, önerileriniz veya teknik destek talepleriniz için aşağıdaki kanallar üzerinden bizimle iletişime geçebilirsiniz.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 space-y-6">
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

                <Card className="p-8">
                    <h3 className="text-xl font-bold mb-6">Hızlı Mesaj Gönder</h3>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium">Adınız</label>
                            <input required type="text" className="w-full mt-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="Ad Soyad" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Konu</label>
                            <input required type="text" className="w-full mt-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="Yardım / Öneri" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Mesajınız</label>
                            <textarea required className="w-full mt-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none min-h-[120px]" placeholder="Mesajınızı buraya yazın..."></textarea>
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Gönder
                                </>
                            )}
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
