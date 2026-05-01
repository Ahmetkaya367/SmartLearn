import { Button } from "@/react-app/components/ui/button";
import { ArrowRight, Play, Sparkles, Users, BookOpen } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Join 100,000+ learners worldwide
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
              Learn without limits,
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                grow without boundaries
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover world-class courses from expert instructors. Master new skills, advance your career, and transform your future.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              Start learning today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-accent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 sm:gap-16 pt-12 border-t border-border/50 mt-12 w-full max-w-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">5,000+</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">100K+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">4.8/5</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
