import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import { Progress } from "@/react-app/components/ui/progress";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle2,
  BookOpen,
  Clock,
  FileText,
  Volume2,
  VolumeX,
  Maximize,
  Pause,
  SkipForward,
  SkipBack,
  List,
  Star,
  Users,
  RotateCcw,
  Lock,
} from "lucide-react";
import { apiService } from "@/react-app/lib/apiService";

const API_URL = "http://127.0.0.1:8080";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: string;
  isPreview?: boolean;
  videoUrl?: string;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export default function StudentCourseViewer() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastProgressUpdate = useRef<number>(0);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await apiService.getCourseById(id);
        setCourse(data);

        // Önce öğrencinin genel istatistiklerinden bu kursun kaydını bul
        const stats = await apiService.getStudentStats();
        const currentProgress = stats?.inProgress?.find((p: any) => p.courseId === id);

        if (currentProgress && currentProgress.enrollmentId) {
          setEnrollmentId(currentProgress.enrollmentId);
          setOverallProgress(currentProgress.progress || 0);
          
          // NEW: Fetch ALL progress to populate completed lessons
          try {
            const allProgress = await apiService.getEnrollmentProgress(currentProgress.enrollmentId);
            if (Array.isArray(allProgress)) {
              const completedIds = allProgress
                .filter((p: any) => p.completed)
                .map((p: any) => p.lessonId);
              setCompletedLessons(new Set(completedIds));
            }
          } catch (e) {
            console.error("Failed to fetch all progress", e);
          }
          
          // ŞİMDİ: Bu kursta en son hangi saniyede kalmıştık?
          try {
            const data = await apiService.getEnrollment(currentProgress.enrollmentId);
            
            if (data.sections && data.sections.length > 0) {
              const lastWatched = data.lastWatchedLesson;
              let targetLesson = null;
              let targetSectionId = null;

              if (lastWatched && lastWatched.lessonId) {
                for (const section of data.sections) {
                  const found = section.lessons.find((l: any) => l.id === lastWatched.lessonId);
                  if (found) {
                    targetLesson = found;
                    targetSectionId = section.id;
                    break;
                  }
                }
              }

              if (targetLesson) {
                await selectLesson(targetLesson, targetSectionId);
              } else if (data.sections[0].lessons?.[0]) {
                await selectLesson(data.sections[0].lessons[0], data.sections[0].id);
              }
            }
          } catch (e) {
            console.error("Last watched fetch failed", e);
          }
        } else if (data.sections?.[0]?.lessons?.[0]) {
          // Kayıt bulunamazsa bile ilk dersi göster
          await selectLesson(data.sections[0].lessons[0], data.sections[0].id);
        }
        
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const initialSeekTime = useRef<number>(0);

  const selectLesson = async (lesson: Lesson, sectionId: string) => {
    setIsPlaying(false);
    setVideoProgress(0);
    lastProgressUpdate.current = 0;

    // Önce ilerlemeyi çek, sonra dersi aktif et (başa atma sorununu çözer)
    if (enrollmentId) {
      try {
        const progress = await apiService.getLessonProgress(enrollmentId, lesson.id);
        const watched = (progress && typeof progress.watchedSeconds !== 'undefined') ? progress.watchedSeconds : 0;
        
        initialSeekTime.current = watched;
        lastProgressUpdate.current = watched; 
      } catch (e) {
        console.error("İlerleme çekilirken hata oluştu:", e);
        initialSeekTime.current = 0;
        lastProgressUpdate.current = 0;
      }
    } else {
      initialSeekTime.current = 0;
      lastProgressUpdate.current = 0;
    }

    setActiveLesson(lesson);
    setActiveSectionId(sectionId);

    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLoadedData = () => {
    if (videoRef.current && initialSeekTime.current > 0) {
      const seekTo = initialSeekTime.current;
      initialSeekTime.current = 0;
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = seekTo;
        }
      }, 200);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      const video = videoRef.current;
      
      if (e.code === 'ArrowLeft') {
        video.currentTime = Math.max(0, video.currentTime - 10);
      } else if (e.code === 'ArrowRight') {
        const nextTime = video.currentTime + 10;
        if (nextTime <= lastProgressUpdate.current + 2) {
          video.currentTime = nextTime;
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || isNaN(videoRef.current.duration)) return;
    
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (!(window as any).isSeeking) {
      setVideoProgress((currentTime / duration) * 100);
    }

    if (enrollmentId && activeLesson) {
      const currentSeconds = Math.floor(currentTime);
      
      // Sadece en uzak noktayı takip et (Backend için)
      if (currentSeconds > lastProgressUpdate.current) {
        lastProgressUpdate.current = currentSeconds;
        
        // Backend'e 5 saniyede bir gönder
        const now = Date.now();
        if (currentSeconds > 0 && (!video.dataset.lastApiCall || now - parseInt(video.dataset.lastApiCall) > 5000)) {
          video.dataset.lastApiCall = now.toString();
          apiService.updateLessonProgress(enrollmentId, activeLesson.id, currentSeconds, false).then(res => {
            if (res?.progressPercent !== undefined) {
              setOverallProgress(prev => Math.max(prev, res.progressPercent));
            }
          });
        }
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (activeLesson && enrollmentId) {
      setCompletedLessons((prev) => new Set([...prev, activeLesson.id]));
      // Save completion to backend
      apiService.updateLessonProgress(enrollmentId, activeLesson.id, Math.floor(videoRef.current?.duration || 0), true);
    }
    goToNextLesson();
  };

  const getVideoUrl = (lesson: Lesson): string | null => {
    if (!lesson.videoUrl) return null;
    if (lesson.videoUrl.startsWith("http")) return lesson.videoUrl;
    return `${API_URL}${lesson.videoUrl}`;
  };

  const getAllLessons = (): { lesson: Lesson; sectionId: string }[] => {
    if (!course?.sections) return [];
    return course.sections.flatMap((s: Section) =>
      s.lessons.map((l) => ({ lesson: l, sectionId: s.id }))
    );
  };

  const goToNextLesson = () => {
    const all = getAllLessons();
    const currentIdx = all.findIndex((x) => x.lesson.id === activeLesson?.id);
    if (currentIdx >= 0 && currentIdx < all.length - 1) {
      const next = all[currentIdx + 1];
      selectLesson(next.lesson, next.sectionId);
      setExpandedSections((prev) => new Set([...prev, next.sectionId]));
    }
  };

  const goToPrevLesson = () => {
    const all = getAllLessons();
    const currentIdx = all.findIndex((x) => x.lesson.id === activeLesson?.id);
    if (currentIdx > 0) {
      const prev = all[currentIdx - 1];
      selectLesson(prev.lesson, prev.sectionId);
      setExpandedSections((prev2) => new Set([...prev2, prev.sectionId]));
    }
  };

  const getTotalLessons = () => {
    return course?.sections?.reduce((total: number, s: Section) => total + s.lessons.length, 0) || 0;
  };

  const getOverallProgress = () => {
    return overallProgress;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
        <div className="h-14 bg-[#16213e] border-b border-white/10 flex items-center px-6 gap-4">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <Skeleton className="h-6 w-64 bg-white/10" />
        </div>
        <div className="flex flex-1">
          <div className="flex-1">
            <Skeleton className="w-full aspect-video bg-black/40" />
          </div>
          <div className="w-80 bg-[#16213e] border-l border-white/10 p-4 space-y-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full bg-white/10" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/40" />
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <Button asChild className="mt-4">
            <Link to="/student">Back to My Learning</Link>
          </Button>
        </div>
      </div>
    );
  }

  const videoUrl = activeLesson ? getVideoUrl(activeLesson) : null;

  return (
    <div className="min-h-screen bg-[#0f0f23] flex flex-col overflow-hidden">

      {/* Top Navigation Bar */}
      <header className="h-14 bg-[#1c1c3a] border-b border-white/10 flex items-center px-4 gap-4 z-50 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-white/70 hover:text-white hover:bg-white/10 gap-1"
        >
          <Link to="/student">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Öğrenimim</span>
          </Link>
        </Button>

        <div className="w-px h-6 bg-white/20" />

        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate">{course.title}</h1>
          {activeLesson && (
            <p className="text-white/50 text-xs truncate">{activeLesson.title}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>{completedLessons.size}/{getTotalLessons()} ders tamamlandı</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 w-32">
            <Progress value={getOverallProgress()} className="h-1.5 bg-white/20" />
            <span className="text-xs text-white/60 shrink-0">%{getOverallProgress()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video + Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Video Player */}
          <div className="bg-black w-full relative group">
            <div className="aspect-video w-full relative">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnded}
                    onLoadedData={handleLoadedData}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    {/* Progress Bar */}
                    <div className="px-4 pb-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step="0.1"
                        value={videoProgress}
                        onMouseDown={() => { (window as any).isSeeking = true; }}
                        onMouseUp={() => { (window as any).isSeeking = false; }}
                        onChange={(e) => {
                          if (!videoRef.current) return;
                          const val = parseFloat(e.target.value);
                          const t = (val / 100) * videoRef.current.duration;
                          
                          // İLERİ SARMA ENGELİ: 2 saniye tolerans (sıkılaştırıldı)
                          if (t > lastProgressUpdate.current + 2) {
                              return;
                          }
                          
                          videoRef.current.currentTime = t;
                          setVideoProgress(val);
                        }}
                        className="w-full h-1 accent-indigo-500 cursor-pointer"
                      />
                    </div>
                    {/* Control Buttons */}
                    <div className="flex items-center gap-2 px-4 pb-3">
                      <button
                        onClick={handleRestart}
                        className="text-white/80 hover:text-white transition-colors p-1"
                        title="Başa Al"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                        }}
                        className="text-white/80 hover:text-white transition-colors p-1"
                        title="10sn Geri"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                      <button
                        onClick={goToNextLesson}
                        className="text-white/80 hover:text-white transition-colors p-1"
                        title="Sonraki ders"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <button
                        onClick={toggleMute}
                        className="text-white/80 hover:text-white transition-colors p-1 ml-2"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => videoRef.current?.requestFullscreen()}
                        className="text-white/80 hover:text-white transition-colors p-1"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {/* Click to play/pause */}
                  <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />
                </>
              ) : (
                /* No video placeholder */
                <div className="w-full h-full flex flex-col items-center justify-center text-white/40 gap-4">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                    <Play className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-white/60">
                      {activeLesson ? activeLesson.title : "Başlamak için bir ders seçin"}
                    </p>
                    <p className="text-sm mt-1">
                      {activeLesson?.videoUrl === undefined || activeLesson?.videoUrl === null
                        ? "Bu ders için video bulunmuyor"
                        : "Video yükleniyor..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Info */}
          {activeLesson && (
            <div className="p-6 md:p-10 max-w-4xl">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{activeLesson.duration || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span className="capitalize">{activeLesson.type || "Video"}</span>
                    </div>
                    {completedLessons.has(activeLesson.id) && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Tamamlandı
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevLesson}
                    className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Önceki
                  </Button>
                  <Button
                    size="sm"
                    onClick={goToNextLesson}
                    className="bg-indigo-600 hover:bg-indigo-500 gap-1"
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Course Info */}
              <div className="border border-white/10 rounded-2xl p-6 bg-white/5 space-y-6">
                <h3 className="text-lg font-semibold text-white">Kurs Hakkında</h3>
                <p className="text-white/60 leading-relaxed">{course.description || course.longDescription}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{course.rating || "—"}</p>
                    <p className="text-white/40 text-xs">Puan</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Users className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{(course.studentCount || 0).toLocaleString()}</p>
                    <p className="text-white/40 text-xs">Öğrenci</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{course.duration || "—"}</p>
                    <p className="text-white/40 text-xs">Süre</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-white/5">
                    <BookOpen className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{getTotalLessons()}</p>
                    <p className="text-white/40 text-xs">Ders</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Course Curriculum */}
        {sidebarOpen && (
          <aside className="w-80 xl:w-96 bg-[#1c1c3a] border-l border-white/10 flex flex-col shrink-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">Kurs İçeriği</h3>
              <p className="text-white/40 text-xs mt-0.5">
                {completedLessons.size} / {getTotalLessons()} ders tamamlandı
              </p>
              <Progress value={getOverallProgress()} className="h-1 mt-2 bg-white/10" />
            </div>

            <div className="overflow-y-auto flex-1">
              {course.sections?.map((section: Section, idx: number) => (
                <div key={section.id} className="border-b border-white/5">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white/40 font-medium">{idx + 1}. Bölüm</span>
                      <p className="text-white/90 text-sm font-medium truncate">{section.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {section.lessons.length} ders
                        {" · "}
                        {section.lessons.filter(l => completedLessons.has(l.id)).length} tamamlandı
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 shrink-0 ml-2 transition-transform duration-200 ${
                        expandedSections.has(section.id) ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Lessons List */}
                  {expandedSections.has(section.id) && (
                    <div className="bg-black/20">
                      {section.lessons.map((lesson: Lesson, lessonIdx: number) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isDone = completedLessons.has(lesson.id);
                        
                        // KİLİT MANTIĞI:
                        // 1. Ders her zaman açık.
                        // Diğer dersler ise ancak bir önceki ders "Tamamlandı" (completedLessons içinde) ise açılır.
                        let isLocked = false;
                        if (idx === 0 && lessonIdx === 0) {
                            isLocked = false;
                        } else {
                            // Tüm dersleri düz bir listede hayal et
                            const allLessons = getAllLessons();
                            const currentIdxInAll = allLessons.findIndex(x => x.lesson.id === lesson.id);
                            if (currentIdxInAll > 0) {
                                const prevLessonId = allLessons[currentIdxInAll - 1].lesson.id;
                                isLocked = !completedLessons.has(prevLessonId);
                            }
                        }

                        return (
                          <button
                            key={lesson.id}
                            disabled={isLocked && !isActive}
                            onClick={() => !isLocked && selectLesson(lesson, section.id)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all ${
                              isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"
                            } ${
                              isActive ? "bg-indigo-600/20 border-l-2 border-indigo-500" : "border-l-2 border-transparent"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : isLocked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock w-4 h-4 text-white/20"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              ) : isActive ? (
                                <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                                  <Play className="w-2 h-2 text-white fill-current ml-0.5" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-white/20" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isActive ? "text-indigo-300" : isLocked ? "text-white/30" : "text-white/70"}`}>
                                {lesson.title}
                              </p>
                              <p className="text-white/30 text-xs mt-0.5">{lesson.duration || "—"}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
