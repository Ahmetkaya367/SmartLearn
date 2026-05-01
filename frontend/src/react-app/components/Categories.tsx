import { Card } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { apiService } from "@/react-app/lib/apiService";
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Camera, 
  Shield,
  Briefcase,
  BarChart3,
  Coins,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    icon: Code,
    name: "Yazılım",
    courseCount: "1,250+ kurs",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-500/30",
  },
  {
    icon: BarChart3,
    name: "Veri Bilimi",
    courseCount: "890+ kurs",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    borderColor: "hover:border-purple-500/30",
  },
  {
    icon: Palette,
    name: "Tasarım",
    courseCount: "740+ kurs",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    borderColor: "hover:border-pink-500/30",
  },
  {
    icon: TrendingUp,
    name: "Pazarlama",
    courseCount: "620+ kurs",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    borderColor: "hover:border-green-500/30",
  },
  {
    icon: Coins,
    name: "Finans",
    courseCount: "480+ kurs",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    borderColor: "hover:border-orange-500/30",
  },
  {
    icon: Camera,
    name: "Fotoğrafçılık",
    courseCount: "530+ kurs",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    borderColor: "hover:border-cyan-500/30",
  },
  {
    icon: Shield,
    name: "Bilişim ve Güvenlik",
    courseCount: "410+ kurs",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    borderColor: "hover:border-red-500/30",
  },
  {
    icon: Briefcase,
    name: "İşletme",
    courseCount: "350+ kurs",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    borderColor: "hover:border-indigo-500/30",
  },
];

export function Categories() {
  const navigate = useNavigate();
  const [courseCounts, setCourseCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    apiService.getAllCourses().then(courses => {
      const counts: Record<string, number> = {};
      courses.forEach(course => {
        counts[course.category] = (counts[course.category] || 0) + 1;
      });
      setCourseCounts(counts);
    });
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/courses?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="popular-categories" className="py-24 sm:py-32 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Popüler Kategorileri Keşfedin
          </h2>
          <p className="text-lg text-muted-foreground">
            Yazılımdan tasarıma, tutkunuzla eşleşen mükemmel kursu bulun ve kariyerinizi bir üst seviyeye taşıyın.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index}
                onClick={() => handleCategoryClick(category.name)}
                className={`p-6 border-border/50 ${category.borderColor} hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
              >
                <div className="flex flex-col gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 rounded-full">
                      {courseCounts[category.name] || 0} kurs
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors mt-4">
                    Keşfet
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                {/* Subtle background glow on hover */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
