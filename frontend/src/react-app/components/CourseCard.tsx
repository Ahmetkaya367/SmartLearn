import { Card } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";
import { Link } from "react-router";
import type { Course } from "@/data/courses";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {

  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {course.status === 'ARCHIVED' && (
          <Badge variant="destructive" className="absolute bottom-3 right-3">
            Yayından Kaldırıldı
          </Badge>
        )}
        {course.status === 'PENDING_APPROVAL' && (
          <Badge className="absolute bottom-3 right-3 bg-blue-500 text-white hover:bg-blue-600">
            Beklemede
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-primary">{course.category}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{course.level}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{course.rating}</span>
            <span>({course.reviewCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.studentCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{course.price} ₺</span>
        </div>
      </div>
    </Card>
    </Link>
  );
}
