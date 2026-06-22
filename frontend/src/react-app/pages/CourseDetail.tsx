import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import {
  Star,
  Users,
  Globe,
  ChevronRight,
  Play,
  FileText,
  Calendar,
  MessageSquare,
  Award,
  Video,
  BookOpen
} from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";
import { useCartStore } from "@/react-app/store/useCartStore";
import { useAuthStore } from "@/react-app/store/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/react-app/components/ui/dialog";
import { X } from "lucide-react";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [instructorStats, setInstructorStats] = useState<any>(null);
  const [otherCourses, setOtherCourses] = useState<any[]>([]);
  const addToCart = useCartStore((state) => state.addToCart);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const [courseData, reviewsData, studentCount] = await Promise.all([
          apiService.getCourseById(id),
          apiService.getCourseReviews(id),
          apiService.getCourseEnrollmentCount(id)
        ]);

        const merged = { ...courseData, reviews: reviewsData, studentCount };
        setCourse(merged);

        // Fetch real instructor stats if instructorId exists
        const courseDataAny = courseData as any;
        if (courseDataAny.instructorId) {
          try {
            const [stats, courses] = await Promise.all([
              apiService.getInstructorStatsByInstructorId(courseDataAny.instructorId),
              apiService.getCoursesByInstructorId(courseDataAny.instructorId)
            ]);
            setInstructorStats(stats);
            setOtherCourses(courses || []);
          } catch (_) { }
        }

        if (user?.role === "student") {
          try {
            const stats = await apiService.getStudentStats();
            if (stats?.enrolledCourses?.includes(id)) {
              setIsEnrolled(true);
            }
          } catch (_) { }
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-slate-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-4 w-32 bg-slate-800" />
                <Skeleton className="h-12 w-3/4 bg-slate-800" />
                <Skeleton className="h-6 w-full bg-slate-800" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-24 bg-slate-800" />
                  <Skeleton className="h-6 w-24 bg-slate-800" />
                </div>
              </div>
              <Skeleton className="h-[400px] w-full rounded-xl bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Kurs bulunamadı</h2>
          <Button asChild>
            <Link to="/courses">Kurslara Dön</Link>
          </Button>
        </div>
      </div>
    );
  }


  const instructorName = course.instructor || "Eğitmen";

  const instructorInitials = instructorName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const totalStudents = instructorStats?.totalStudents ?? course.instructorStudents ?? 0;
  const totalCourses = instructorStats?.courseCount ?? course.instructorCourses ?? 0;
  const instructorRating = course.instructorRating || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Kurs Başlık Bölümü */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Link to="/courses" className="hover:text-white transition-colors">Kurslar</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-primary font-medium">{course.category}</span>
              </div>

              <h1 className="text-4xl font-bold leading-tight">{course.title}</h1>
              <p className="text-lg text-slate-300">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-slate-400">({(course.reviewCount ?? 0).toLocaleString()} değerlendirme)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{(course.studentCount ?? 0).toLocaleString()} öğrenci</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{course.language || "Türkçe"}</span>
                </div>
                {course.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Güncellendi: {course.updatedAt}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600 shrink-0">
                  {course.instructorImage ? (
                    <img src={course.instructorImage} alt={instructorName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm">{instructorInitials}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Eğitmen</p>
                  <p className="font-medium text-primary">{instructorName}</p>
                </div>
              </div>
            </div>

            {/* Satın Alma Kutusu */}
            <div className="relative">
              <Card className="p-6 sticky top-24 border-slate-700 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
                <div
                  className="aspect-video rounded-lg overflow-hidden mb-6 relative group cursor-pointer"
                  onClick={() => setShowPreview(true)}
                >
                  <img
                    src={course.thumbnail || course.image || course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 inset-x-0 text-center text-xs font-medium text-white">
                    Kursu Önizle
                  </div>
                </div>

                <div className="space-y-6">
                  {user?.role === "admin" || user?.role === "instructor" ? (
                    <div className="space-y-3">
                      <Button className="w-full h-12 text-lg font-bold" size="lg" disabled>
                        Önizleme Modu
                      </Button>
                    </div>
                  ) : isEnrolled ? (
                    <div className="space-y-3">
                      <Button
                        className="w-full h-12 text-lg font-bold"
                        size="lg"
                        asChild
                      >
                        <Link to={`/learning/${course.id}`}>Kursa Git</Link>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{course.price} ₺</span>
                      </div>

                      <div className="space-y-3">
                        <Button
                          className="w-full h-12 text-lg font-bold"
                          size="lg"
                          onClick={() => {
                            addToCart({
                              id: course.id,
                              title: course.title,
                              price: course.price,
                              thumbnail: course.thumbnail || course.image,
                              instructor: instructorName
                            });
                          }}
                        >
                          Sepete Ekle
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full h-12 text-lg font-bold border-slate-600 hover:bg-slate-700 text-slate-200"
                          size="lg"
                          onClick={() => {
                            addToCart({
                              id: course.id,
                              title: course.title,
                              price: course.price,
                              thumbnail: course.thumbnail || course.image,
                              instructor: instructorName
                            });
                            navigate("/cart");
                          }}
                        >
                          Hemen Satın Al
                        </Button>
                      </div>
                    </>
                  )}

                  <p className="text-center text-xs text-slate-400">30 Gün İade Garantisi</p>

                  <div className="space-y-4 border-t border-slate-700/50 pt-6">
                    <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bu kurs içerir:
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-300">
                      {course.duration && (
                        <li className="flex items-center gap-3">
                          <Video className="w-4 h-4" />
                          {course.duration} talep üzerine video
                        </li>
                      )}
                      <li className="flex items-center gap-3">
                        <FileText className="w-4 h-4" />
                        Makaleler ve kaynaklar
                      </li>
                      <li className="flex items-center gap-3">
                        <Users className="w-4 h-4" />
                        Ömür boyu tam erişim
                      </li>
                      <li className="flex items-center gap-3">
                        <Globe className="w-4 h-4" />
                        Mobil ve TV'den erişim
                      </li>
                      <li className="flex items-center gap-3">
                        <Award className="w-4 h-4" />
                        Tamamlama sertifikası
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">

            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-8 overflow-x-auto">
                <TabsTrigger value="curriculum" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base">Müfredat</TabsTrigger>
                <TabsTrigger value="instructor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base">Eğitmen</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base">Değerlendirmeler</TabsTrigger>
              </TabsList>

              {/* Müfredat Sekmesi - Sadece Course Content */}
              <TabsContent value="curriculum" className="space-y-8 mt-0 outline-none">
                <section>
                  <h2 className="text-2xl font-bold mb-6">Kurs İçeriği</h2>
                  {course.curriculum && course.curriculum.length > 0 ? (
                    <div className="border rounded-xl overflow-hidden">
                      {course.curriculum.map((section: any, idx: number) => (
                        <div key={idx} className="border-b last:border-0">
                          <div className="bg-muted/50 p-4 flex items-center justify-between font-semibold">
                            <div className="flex items-center gap-3">
                              <ChevronRight className="w-4 h-4" />
                              {section.title}
                            </div>
                            <span className="text-muted-foreground font-normal text-xs">
                              {section.lessons?.length || 0} ders
                            </span>
                          </div>
                          <div className="p-0">
                            {section.lessons?.map((lesson: any, lIdx: number) => (
                              <div key={lIdx} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3 text-sm">
                                  <Play className="w-4 h-4 text-muted-foreground" />
                                  <span>{lesson.title}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{lesson.duration || "—"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground border rounded-xl">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Kurs içeriği henüz eklenmemiş.</p>
                    </div>
                  )}
                </section>
              </TabsContent>

              {/* Eğitmen Sekmesi */}
              <TabsContent value="instructor" className="mt-0 outline-none">
                <Card className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar + İstatistikler */}
                    <div className="shrink-0 flex flex-col items-center text-center space-y-5">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted flex items-center justify-center bg-primary/10">
                        {course.instructorImage ? (
                          <img src={course.instructorImage} alt={instructorName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-primary">{instructorInitials}</span>
                        )}
                      </div>

                      <div className="space-y-3 w-full">
                        {instructorRating > 0 && (
                          <div className="flex items-center justify-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <div>
                              <p className="font-bold text-foreground">{instructorRating.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">Eğitmen Puanı</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-xl p-3">
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-bold text-foreground">{totalStudents.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Öğrenci</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-xl p-3">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-bold text-foreground">{totalCourses}</p>
                            <p className="text-xs text-muted-foreground">Kurs</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Eğitmen Bilgileri / Kursları */}
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{instructorName}</h3>
                        {course.instructorTitle && (
                          <p className="text-muted-foreground font-medium mt-1">{course.instructorTitle}</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-muted">
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Yayınladığı Kurslar
                        </h4>
                        {otherCourses.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {otherCourses.map((c: any) => (
                              <div key={c.id} className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between group hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors">{c.title}</span>
                                <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Henüz başka kurs bulunmuyor.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Değerlendirmeler Sekmesi */}
              <TabsContent value="reviews" className="mt-0 outline-none">
                <div className="space-y-6">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="text-center space-y-1">
                      <p className="text-5xl font-bold text-primary">{course.rating || "—"}</p>
                      <div className="flex text-yellow-400 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(course.rating ?? 0) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground">Kurs Puanı</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {course.reviews && course.reviews.length > 0 ? course.reviews.map((review: any) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {review.userAvatar ? (
                              <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {review.userName ? review.userName.charAt(0).toUpperCase() : 'Ö'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{review.userName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString("tr-TR") : 'Az önce'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic line-clamp-3">
                          {review.comment ? `"${review.comment}"` : "Yorum yapılmadı."}
                        </p>
                      </Card>
                    )) : (
                      <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Önizleme Modalı */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-900 border-slate-800">
          <DialogHeader className="p-4 border-b border-slate-800 absolute top-0 inset-x-0 z-10 bg-slate-900/80 backdrop-blur-md">
            <DialogTitle className="text-white text-lg flex items-center gap-3">
              <Play className="w-5 h-5 text-primary" />
              Kurs Önizleme: {course.title}
            </DialogTitle>
          </DialogHeader>

          <div className="aspect-video w-full mt-14 flex items-center justify-center bg-black">
            {course.videoPreviewUrl ? (
              <video
                src={course.videoPreviewUrl}
                controls
                className="w-full h-full"
                autoPlay
              >
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                  <Video className="w-10 h-10 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Tanıtım videosu eklenmemiş</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">
                    Bu kurs için henüz bir önizleme videosu bulunmuyor. Kurs içeriğini müfredat bölümünden inceleyebilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
