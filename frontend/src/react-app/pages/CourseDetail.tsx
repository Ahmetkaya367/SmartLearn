import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/react-app/components/ui/tabs";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import {
  Star,
  Users,
  Clock,
  Globe,
  ChevronRight,
  Play,
  FileText,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Award,
  Video
} from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const data = await apiService.getCourseById(id);
        setCourse(data);
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
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button asChild>
            <Link to="/courses">Back to courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const discount = course.originalPrice && course.originalPrice > course.price 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Course Header Section */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-primary font-medium">{course.category}</span>
              </div>

              <h1 className="text-4xl font-bold leading-tight">{course.title}</h1>
              <p className="text-lg text-slate-300">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-slate-400">({(course.reviewCount ?? 0).toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{(course.studentCount ?? 0).toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>{course.language || "English"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Updated {course.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600">
                  {course.instructorImage ? (
                    <img src={course.instructorImage} alt={course.instructor} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm">{course.instructor.split(' ').map((n: string) => n[0]).join('')}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Created by</p>
                  <p className="font-medium text-primary cursor-pointer hover:underline">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="relative">
              <Card className="p-6 sticky top-24 border-slate-700 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
                <div className="aspect-video rounded-lg overflow-hidden mb-6 relative group cursor-pointer">
                  <img
                    src={course.thumbnail || course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 inset-x-0 text-center text-xs font-medium text-white">
                    Preview this course
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">${course.price}</span>
                    {course.originalPrice > course.price && (
                      <>
                        <span className="text-lg text-slate-400 line-through">${course.originalPrice}</span>
                        <Badge variant="destructive" className="bg-red-500 text-white border-0">
                          {discount}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full h-12 text-lg font-bold" size="lg">Add to Cart</Button>
                    <Button variant="outline" className="w-full h-12 text-lg font-bold border-slate-600 hover:bg-slate-700 text-slate-200" size="lg">Buy Now</Button>
                  </div>

                  <p className="text-center text-xs text-slate-400">30-Day Money-Back Guarantee</p>

                  <div className="space-y-4 border-t border-slate-700/50 pt-6">
                    <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      This course includes:
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li className="flex items-center gap-3">
                        <Video className="w-4 h-4" />
                        {course.duration} on-demand video
                      </li>
                      <li className="flex items-center gap-3">
                        <FileText className="w-4 h-4" />
                        Articles and resources
                      </li>
                      <li className="flex items-center gap-3">
                        <Users className="w-4 h-4" />
                        Full lifetime access
                      </li>
                      <li className="flex items-center gap-3">
                        <Globe className="w-4 h-4" />
                        Access on mobile and TV
                      </li>
                      <li className="flex items-center gap-3">
                        <Award className="w-4 h-4" />
                        Certificate of completion
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

            {/* Tabs for curriculum, instructor, reviews */}
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-8 overflow-x-auto">
                <TabsTrigger value="curriculum" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base">Instructor</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-base">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="space-y-8 mt-0 outline-none">
                {/* What you'll learn */}
                <Card className="p-8 border-border/60 bg-muted/20">
                  <h2 className="text-xl font-bold mb-6">What you'll learn</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.whatYouWillLearn?.map((item: string, index: number) => (
                      <div key={index} className="flex gap-3 text-sm text-foreground/80">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <section>
                  <h2 className="text-2xl font-bold mb-6">Course content</h2>
                  <div className="border rounded-xl overflow-hidden">
                    {course.curriculum?.map((section: any, idx: number) => (
                      <div key={idx} className="border-b last:border-0">
                        <div className="bg-muted/50 p-4 flex items-center justify-between font-semibold">
                          <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4" />
                            {section.title}
                          </div>
                          <span className="text-muted-foreground font-normal text-xs">{section.lessons.length} lectures • {section.duration}</span>
                        </div>
                        <div className="p-0">
                          {section.lessons.map((lesson: any, lIdx: number) => (
                            <div key={lIdx} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3 text-sm">
                                <Play className="w-4 h-4 text-muted-foreground" />
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="instructor" className="mt-0 outline-none">
                <Card className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="shrink-0 flex flex-col items-center text-center space-y-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted">
                        <img src={course.instructorImage} alt={course.instructor} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-bold text-foreground">{course.instructorRating} Instructor Rating</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                          <Users className="w-4 h-4" />
                          <span>{(course.instructorStudents ?? 0).toLocaleString()} Students</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                          <Play className="w-4 h-4" />
                          <span>{course.instructorCourses} Courses</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{course.instructor}</h3>
                        <p className="text-muted-foreground font-medium">{course.instructorTitle}</p>
                      </div>
                      <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
                        {course.instructorBio}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 outline-none">
                <div className="space-y-6">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="text-center space-y-1">
                      <p className="text-5xl font-bold text-primary">{course.rating}</p>
                      <div className="flex text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                      </div>
                      <p className="text-sm font-semibold">Course Rating</p>
                    </div>
                    {/* Add more detailed rating breakdown if needed */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {course.reviews?.map((review: any) => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {review.userAvatar ? <img src={review.userAvatar} alt={review.userName} /> : <Users className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{review.userName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic line-clamp-3">"{review.comment}"</p>
                      </Card>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">See all reviews</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
