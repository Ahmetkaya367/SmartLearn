import { useEffect, useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { BookOpen, Clock, Award, Play } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { Progress } from "@/react-app/components/ui/progress";
import { Link } from "react-router";

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getStudentStats();
        
        if (data && data.inProgress && Array.isArray(data.inProgress)) {
          const enrichedInProgress = await Promise.all(
            data.inProgress.map(async (item: any) => {
              try {
                const courseDetail = await apiService.getCourseById(item.courseId);
                return {
                  ...item,
                  courseTitle: courseDetail.title,
                  courseImage: courseDetail.thumbnail || courseDetail.image
                };
              } catch (e) {
                return {
                  ...item,
                  courseTitle: `Course ID: ${item.courseId}`,
                  courseImage: null
                };
              }
            })
          );
          data.inProgress = enrichedInProgress;
        }

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch student stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-6 w-80 mb-12" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            My Learning
          </h1>
          <p className="text-lg text-muted-foreground">
            Continue where you left off
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.enrolledCourses.length}</p>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.learningTime}</p>
                <p className="text-sm text-muted-foreground">Learning Time</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.certificates}</p>
                <p className="text-sm text-muted-foreground">Certificates</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses in Progress */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Courses in Progress
          </h2>
          {stats?.inProgress.length > 0 ? (
            <div className="space-y-4">
              {stats.inProgress.map((item: any) => (
                <Card key={item.courseId} className="p-6 overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {item.courseImage ? (
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                        <img 
                          src={item.courseImage} 
                          alt={item.courseTitle || 'Course thumbnail'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-48 h-32 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.courseTitle || `Course ID: ${item.courseId}`}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Last accessed: {item.lastAccessed}</span>
                        </div>
                      </div>
                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Overall Progress</span>
                          <span className="font-bold text-primary">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2.5" />
                      </div>
                    </div>
                    <div className="md:ml-auto flex items-center mt-4 md:mt-0">
                      <Button asChild size="lg" className="w-full md:w-auto shadow-md hover:shadow-lg transition-all gap-2">
                        <Link to={`/learning/${item.courseId}`}>
                          <Play className="w-4 h-4 fill-current" />
                          Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                You haven't enrolled in any courses yet
              </p>
              <Button className="mt-4" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
