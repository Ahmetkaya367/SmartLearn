import { Card } from "@/react-app/components/ui/card";
import { HelpCircle, ChevronRight } from "lucide-react";

const faqs = [
    {
        q: "Şifremi nasıl değiştirebilirim?",
        a: "Profil sayfanıza giderek 'Şifre Güncelleme' bölümünden mevcut ve yeni şifrenizi girerek hızlıca değiştirebilirsiniz."
    },
    {
        q: "Kursları çevrimdışı izleyebilir miyim?",
        a: "Şu an için kurslar aktif bir internet bağlantısı gerektirmektedir. Gelecek sürümler için çevrimdışı izleme özelliği üzerinde çalışmaktayız."
    },
    {
        q: "Eğitmen olabilir miyim?",
        a: "İletişim sayfasından bizimle iletişime geçerek eğitmenlik başvurusu yapabilirsiniz. Uzmanlığınızı paylaşmanızdan mutluluk duyarız."
    },
    {
        q: "Profil fotoğrafım neden güncellenmiyor?",
        a: "Fotoğraf yükledikten sonra tarayıcınızın önbelleği nedeniyle sayfanızı bir kez yenilemeniz gerekebilir. Sorun devam ederse destek ekibine e-posta gönderin."
    }
];

export default function FAQ() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Sıkça Sorulan Sorular</h1>
            <p className="text-muted-foreground mb-8">Aklınıza takılan sorulara hızlı cevaplar bulun.</p>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <Card key={index} className="p-6 transition-all duration-300 hover:shadow-md group">
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {faq.q}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="mt-12 p-8 bg-primary/5 border-primary/20 text-center">
                <h3 className="text-xl font-semibold mb-2">Başka bir sorunuz mu var?</h3>
                <p className="text-muted-foreground mb-4">Aradığınız cevabı bulamadıysanız bize ulaşmaktan çekinmeyin.</p>
                <a href="/contact" className="inline-flex items-center text-primary font-semibold hover:underline">
                    Destek Ekibine Yazın <ChevronRight className="ml-1 w-4 h-4" />
                </a>
            </Card>
        </div>
    );
}
