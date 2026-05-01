import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Card } from "@/react-app/components/ui/card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Label } from "@/react-app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/react-app/components/ui/radio-group";
import { Checkbox } from "@/react-app/components/ui/checkbox";
import { Skeleton } from "@/react-app/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import { CourseCard } from "@/react-app/components/CourseCard";
import { categories, levels, priceRanges } from "@/data/courses";
import { apiService } from "@/react-app/lib/apiService";

type SortOption = 'popular' | 'rating' | 'newest' | 'price-low' | 'price-high';

export default function Courses() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tüm Kategoriler");
  const [selectedLevel, setSelectedLevel] = useState("Tüm Seviyeler");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiService.getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    const fetchCategories = async () => {
      try {
        const cats = await apiService.getCategories();
        // 'Tüm Kategoriler' seçeneğini listenin başına ekle
        setDynamicCategories(["Tüm Kategoriler", ...cats.filter(c => c !== "Tüm Kategoriler")]);
        
        // URL'den kategori parametresi gelmişse onu seç
        const categoryParam = searchParams.get("category");
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses].filter(course => {
      // Search filter
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "Tüm Kategoriler" || course.category === selectedCategory;

      // Level filter
      const matchesLevel = selectedLevel === "Tüm Seviyeler" || course.level === selectedLevel;

      // Price filter
      const priceRange = priceRanges[selectedPriceRange];
      const matchesPrice = course.price >= priceRange.min && course.price <= priceRange.max;

      // Rating filter
      const matchesRating = course.rating >= minRating;

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });

    // Sort courses
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.studentCount - a.studentCount);
        break;
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedPriceRange, minRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tüm Kategoriler");
    setSelectedLevel("Tüm Seviyeler");
    setSelectedPriceRange(0);
    setMinRating(0);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "Tüm Kategoriler" ||
    selectedLevel !== "Tüm Seviyeler" || selectedPriceRange !== 0 || minRating > 0;

  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Kategori</h3>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          {dynamicCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={category} id={`category-${category}`} />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer text-foreground"
              >
                {category}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Level Filter */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-semibold text-foreground mb-3">Seviye</h3>
        <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel}>
          {levels.map((level) => (
            <div key={level} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={level} id={`level-${level}`} />
              <Label
                htmlFor={`level-${level}`}
                className="text-sm font-normal cursor-pointer text-foreground"
              >
                {level}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Filter */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-semibold text-foreground mb-3">Fiyat</h3>
        <RadioGroup
          value={selectedPriceRange.toString()}
          onValueChange={(value) => setSelectedPriceRange(parseInt(value))}
        >
          {priceRanges.map((range, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={index.toString()} id={`price-${index}`} />
              <Label
                htmlFor={`price-${index}`}
                className="text-sm font-normal cursor-pointer text-foreground"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Rating Filter */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-semibold text-foreground mb-3">Minimum Puan</h3>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => setMinRating(checked ? rating : 0)}
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="text-sm font-normal cursor-pointer text-foreground flex items-center gap-1"
              >
                {rating > 0 ? `${rating}+ yıldız` : 'Tüm puanlar'}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          Tüm Filtreleri Temizle
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Kursları Keşfet
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Uzman eğitmenlerin verdiği binlerce kursu keşfedin
          </p>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Kurs arayın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <Card className="p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">Filtreler</h2>
              </div>
              <FiltersSidebar />
            </Card>
          </aside>

          {/* Mobile Filters Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtreler {hasActiveFilters && `(Aktif)`}
            </Button>

            {showMobileFilters && (
              <Card className="p-6 mb-6">
                <FiltersSidebar />
              </Card>
            )}
          </div>

          {/* Course Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredCourses.length}</span> kurs gösteriliyor
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sırala:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">En Popüler</SelectItem>
                    <SelectItem value="rating">En Yüksek Puan</SelectItem>
                    <SelectItem value="newest">En Yeni</SelectItem>
                    <SelectItem value="price-low">Fiyat: Düşükten Yükseğe</SelectItem>
                    <SelectItem value="price-high">Fiyat: Yüksekten Düşüğe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="overflow-hidden h-[400px]">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Kriterlerinize uygun kurs bulunamadı
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
