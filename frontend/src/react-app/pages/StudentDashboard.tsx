import { useEffect, useState } from "react";
import { Card } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { BookOpen, Clock, Award, Play, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { Progress } from "@/react-app/components/ui/progress";
import { Link } from "react-router";
import { useAuthStore } from "@/react-app/store/useAuthStore";
import { toast } from "sonner";
import { Textarea } from "@/react-app/components/ui/textarea";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<Record<string, { rating: number; comment: string; submitting: boolean }>>({});

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

        if (data && data.enrolledCourses) {
            const initialReviews: any = {};
            for (const courseId of data.enrolledCourses) {
                try {
                    const existingReview = await apiService.getUserReviewForCourse(user?.id || "", courseId);
                    initialReviews[courseId] = {
                        rating: existingReview.exists ? existingReview.rating : 0,
                        comment: existingReview.exists ? existingReview.comment : "",
                        submitting: false,
                        exists: existingReview.exists
                    };
                } catch (e) {
                    initialReviews[courseId] = { rating: 0, comment: "", submitting: false, exists: false };
                }
            }
            setReviewData(initialReviews);
        }

        setStats(data);
      } catch (error) {
        console.error("Failed to fetch student stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleReviewSubmit = async (courseId: string) => {
    const data = reviewData[courseId];
    if (!data.rating) {
        toast.error("Lütfen bir puan seçin.");
        return;
    }

    setReviewData(prev => ({ ...prev, [courseId]: { ...prev[courseId], submitting: true } }));
    try {
        await apiService.submitReview(courseId, data.rating, data.comment, user?.name);
        toast.success("Değerlendirmeniz kaydedildi.");
        setReviewData(prev => ({ ...prev, [courseId]: { ...prev[courseId], submitting: false, exists: true } }));
    } catch (error) {
        toast.error("Hata oluştu.");
        setReviewData(prev => ({ ...prev, [courseId]: { ...prev[courseId], submitting: false } }));
    }
  };

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
            Öğrenimim
          </h1>
          <p className="text-lg text-muted-foreground">
            Kaldığınız yerden devam edin
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
                <p className="text-sm text-muted-foreground">Kayıtlı Kurs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.inProgress?.reduce((sum: number, item: any) => {
                    const total = item.progress === 100 ? 1 : 0;
                    return sum + total;
                  }, 0) ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Tamamlanan Ders</p>
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
                <p className="text-sm text-muted-foreground">Sertifikalar</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses in Progress */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Devam Eden Kurslarım
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
                          alt={item.courseTitle || 'Kurs kapak'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-48 h-32 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.courseTitle || `Kurs ID: ${item.courseId}`}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {/* Son erişim kaldırıldı */}
                      </div>
                      <div className="space-y-2 mt-auto">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Genel İlerleme</span>
                          <span className="font-bold text-primary">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2.5" />
                      </div>
                    </div>
                    <div className="md:ml-auto flex items-center mt-4 md:mt-0">
                      <Button asChild size="lg" className="w-full md:w-auto shadow-md hover:shadow-lg transition-all gap-2">
                        <Link to={`/learning/${item.courseId}`}>
                          <Play className="w-4 h-4 fill-current" />
                          Öğrenmeye Devam Et
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
                Henüz hiçbir kursa kayıt olmadınız.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/courses">Kurslara Göz At</Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            Kurs Değerlendirmelerim
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats?.inProgress.map((item: any) => {
              const review = reviewData[item.courseId] || { rating: 0, comment: "", submitting: false, exists: false };
              return (
                <Card key={`review-${item.courseId}`} className="p-6">
                  <div className="flex gap-4 mb-4">
                    {item.courseImage ? (
                      <img src={item.courseImage} className="w-20 h-12 rounded object-cover" alt="" />
                    ) : (
                      <div className="w-20 h-12 rounded bg-muted flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1">{item.courseTitle}</h4>
                      <p className="text-xs text-muted-foreground">Değerlendirmenizi bırakın</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewData(prev => ({ 
                            ...prev, 
                            [item.courseId]: { ...prev[item.courseId], rating: star } 
                          }))}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-6 h-6 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} 
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-medium text-muted-foreground">
                        {review.rating > 0 ? `${review.rating} Yıldız` : 'Puan Verin'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Kurs hakkındaki düşüncelerinizi paylaşın..."
                        value={review.comment}
                        onChange={(e) => setReviewData(prev => ({ 
                          ...prev, 
                          [item.courseId]: { ...prev[item.courseId], comment: e.target.value } 
                        }))}
                        className="min-h-[80px] text-sm"
                      />
                    </div>

                    <Button 
                      className="w-full gap-2" 
                      size="sm"
                      disabled={review.submitting}
                      onClick={() => handleReviewSubmit(item.courseId)}
                    >
                      {review.submitting ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          {review.exists ? "Güncelle" : "Değerlendirmeyi Gönder"}
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
