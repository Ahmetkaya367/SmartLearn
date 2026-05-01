import { Card } from "@/react-app/components/ui/card";
import { 
  GraduationCap, 
  Clock, 
  Award, 
  Users, 
  Smartphone, 
  Infinity 
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Uzman Eğitmenler",
    description: "Sektör profesyonellerinden gerçek dünya deneyimi ve kanıtlanmış öğretim yöntemleriyle öğrenin.",
  },
  {
    icon: Clock,
    title: "Kendi Hızınızda Öğrenin",
    description: "Kurslara 7/24 erişin ve kendi programınıza göre öğrenin. İstediğiniz zaman duraklatın ve tekrar izleyin.",
  },
  {
    icon: Award,
    title: "Tanınmış Sertifikalar",
    description: "Başarılarınızı sergilemek ve kariyerinizi geliştirmek için tamamlama sertifikaları kazanın.",
  },
  {
    icon: Users,
    title: "Aktif Topluluk",
    description: "Diğer öğrencilerle bağlantı kurun, içgörülerinizi paylaşın ve canlı topluluğumuzda birlikte büyüyün.",
  },
  {
    icon: Smartphone,
    title: "Mobil Öğrenme",
    description: "Kurslarınıza herhangi bir cihazdan erişin. Benzersiz mobil deneyimimizle hareket halindeyken öğrenin.",
  },
  {
    icon: Infinity,
    title: "Sınırsız Erişim",
    description: "Tek bir abonelikle binlerce kursa sınırsız erişim sağlayın. Gizli ücret veya ek maliyet yok.",
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Neden Learnify?
          </h2>
          <p className="text-lg text-muted-foreground">
            Öğrenme yolculuğunuzda başarılı olmanız için ihtiyacınız olan her şey tek bir yerde.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 lg:p-8 border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
