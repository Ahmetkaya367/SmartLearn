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
    title: "Expert Instructors",
    description: "Learn from industry professionals with real-world experience and proven teaching methods.",
  },
  {
    icon: Clock,
    title: "Learn at Your Pace",
    description: "Access courses 24/7 and learn on your schedule. Pause, rewind, and review anytime.",
  },
  {
    icon: Award,
    title: "Recognized Certificates",
    description: "Earn certificates upon completion to showcase your achievements and boost your career.",
  },
  {
    icon: Users,
    title: "Active Community",
    description: "Connect with fellow learners, share insights, and grow together in our vibrant community.",
  },
  {
    icon: Smartphone,
    title: "Mobile Learning",
    description: "Access your courses on any device. Learn on the go with our seamless mobile experience.",
  },
  {
    icon: Infinity,
    title: "Unlimited Access",
    description: "Get unlimited access to thousands of courses with a single subscription. No hidden fees.",
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why choose Learnify?
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to succeed in your learning journey, all in one place
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
