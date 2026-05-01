import { useEffect, useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Users, Video, DollarSign, TrendingUp } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-96 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Yönetici Paneli
          </h1>
          <p className="text-lg text-muted-foreground">
            Platform genel bakışı ve yönetimi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalCourses}</p>
                <p className="text-sm text-muted-foreground">Toplam Kurs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalRevenue.toLocaleString()} ₺</p>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.growthRate}%</p>
                <p className="text-sm text-muted-foreground">Büyüme Oranı</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Son Kayıt Olanlar
            </h3>
            <div className="space-y-4">
              {stats?.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.joinedAt}</span>
                </div>
              ))}
              {stats?.recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Henüz kullanıcı yok
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Onay Bekleyen Kurslar
            </h3>
            <div className="space-y-4">
              {stats?.pendingApprovals.map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor} tarafından</p>
                  </div>
                  <Button size="sm" variant="outline">İncele</Button>
                </div>
              ))}
              {stats?.pendingApprovals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Bekleyen başvuru yok
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
