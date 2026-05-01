import { useEffect, useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Plus, Video, Users, DollarSign } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { CourseCard } from "@/react-app/components/CourseCard";

export default function InstructorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, myCourses] = await Promise.all([
          apiService.getInstructorStats(),
          apiService.getInstructorCourses()
        ]);
        setStats(statsData);
        setCourses(myCourses);
      } catch (error) {
        console.error("Failed to fetch instructor dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
                Instructor Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your courses and track your success
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Course
            </Button>
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
                <p className="text-2xl font-bold text-foreground">{stats?.totalCourses}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.totalStudents.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${stats?.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">${stats?.thisMonthRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Courses */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            My Courses
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
                You haven't created any courses yet
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Course
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
