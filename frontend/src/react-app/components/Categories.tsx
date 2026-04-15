import { Card } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Music, 
  Camera, 
  Heart,
  Briefcase,
  Languages,
  ArrowRight
} from "lucide-react";

const categories = [
  {
    icon: Code,
    name: "Development",
    courseCount: "1,250+ courses",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-500/30",
  },
  {
    icon: Briefcase,
    name: "Business",
    courseCount: "890+ courses",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    borderColor: "hover:border-purple-500/30",
  },
  {
    icon: Palette,
    name: "Design",
    courseCount: "740+ courses",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    borderColor: "hover:border-pink-500/30",
  },
  {
    icon: TrendingUp,
    name: "Marketing",
    courseCount: "620+ courses",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    borderColor: "hover:border-green-500/30",
  },
  {
    icon: Music,
    name: "Music",
    courseCount: "480+ courses",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    borderColor: "hover:border-orange-500/30",
  },
  {
    icon: Camera,
    name: "Photography",
    courseCount: "530+ courses",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    borderColor: "hover:border-cyan-500/30",
  },
  {
    icon: Heart,
    name: "Health & Fitness",
    courseCount: "410+ courses",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    borderColor: "hover:border-red-500/30",
  },
  {
    icon: Languages,
    name: "Languages",
    courseCount: "350+ courses",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    borderColor: "hover:border-indigo-500/30",
  },
];

export function Categories() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explore top categories
          </h2>
          <p className="text-lg text-muted-foreground">
            From coding to creativity, find the perfect course to match your passion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index}
                className={`p-6 border-border/50 ${category.borderColor} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {category.courseCount}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                    Explore
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
