import { useEffect, useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Plus, Video, Users, DollarSign } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { CourseCard } from "@/react-app/components/CourseCard";
import { useAuthStore } from "@/react-app/store/useAuthStore";

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [statsData, myCourses, earningsData] = await Promise.all([
          apiService.getInstructorStats(),
          apiService.getInstructorCourses(),
          apiService.getInstructorEarnings(user.id)
        ]);

        // Earnings verisiyle Dashboard verisini ez (Senkronize et)
        let finalStats = { ...statsData };
        if (earningsData) {
            // Frontend Fallback (Eğer backend 0 dönerse listeden hesapla)
            let currentMonthRevenue = earningsData.thisMonthRevenue || 0;
            if (currentMonthRevenue === 0 && earningsData.transactions) {
                const todayPrefix = new Date().toISOString().split('T')[0];
                currentMonthRevenue = earningsData.transactions
                    .filter((tr: any) => tr.date.startsWith(todayPrefix))
                    .reduce((sum: number, tr: any) => sum + (tr.amount || 0), 0);
            }

            finalStats.totalRevenue = earningsData.totalBalance || 0;
            finalStats.thisMonthRevenue = currentMonthRevenue;
        }

        setStats(finalStats);
        setCourses(myCourses);
      } catch (error) {
        console.error("Failed to fetch instructor dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Eğitmen Paneli
              </h1>
              <p className="text-lg text-muted-foreground">
                Kurslarınızı yönetin ve başarınızı takip edin
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalCourses || 0}</p>
                <p className="text-sm text-muted-foreground">Toplam Kurs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(stats?.totalStudents || 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Toplam Öğrenci</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(stats?.totalRevenue || 0).toLocaleString()} ₺</p>
                <p className="text-sm text-muted-foreground">Toplam Kazanç</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(stats?.thisMonthRevenue || 0).toLocaleString()} ₺</p>
                <p className="text-sm text-muted-foreground">Bu Ay</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Courses */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Kurslarım
          </h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Henüz bir kurs oluşturmadınız.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
