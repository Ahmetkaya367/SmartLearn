export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  thumbnail: string;
  isBestseller?: boolean;
  updatedAt: string;
  status?: string;
}

export const courses: Course[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    title: 'Kapsamlı Web Geliştirme Eğitimi',
    description: 'HTML, CSS, JavaScript, React, Node.js ve daha fazlasını bu kapsamlı eğitimle öğrenin',
    instructor: 'Seda Yılmaz',
    category: 'Yazılım',
    price: 49.99,
    originalPrice: 199.99,
    rating: 4.8,
    reviewCount: 12543,
    studentCount: 45230,
    duration: '42 saat',
    level: 'Başlangıç',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    isBestseller: true,
    updatedAt: '2024-01-15'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    title: 'Yapay Zeka ve Veri Bilimi: Makine Öğrenmesi',
    description: 'Python ile Makine Öğrenmesinde uzmanlaşın, gerçek dünya yapay zeka uygulamaları geliştirin',
    instructor: 'Dr. Murat Can',
    category: 'Veri Bilimi',
    price: 59.99,
    originalPrice: 179.99,
    rating: 4.9,
    reviewCount: 8932,
    studentCount: 32100,
    duration: '38 saat',
    level: 'Orta',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=450&fit=crop',
    isBestseller: true,
    updatedAt: '2024-02-01'
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    title: 'Dijital Pazarlama Ustalık Sınıfı',
    description: 'Sıfırdan SEO, sosyal medya pazarlaması, e-posta pazarlaması ve Google Ads öğrenin',
    instructor: 'Emine Çelik',
    category: 'Pazarlama',
    price: 39.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviewCount: 6543,
    studentCount: 28900,
    duration: '28 saat',
    level: 'Başlangıç',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    updatedAt: '2024-01-28'
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    title: 'UI/UX Tasarımı: Başlangıçtan Profesyonelliğe',
    description: 'Figma, kullanıcı araştırması, tel kafes (wireframing) ve prototipleme ile harika tasarımlar yaratın',
    instructor: 'Ali Demir',
    category: 'Tasarım',
    price: 44.99,
    originalPrice: 169.99,
    rating: 4.8,
    reviewCount: 5234,
    studentCount: 19800,
    duration: '32 saat',
    level: 'Başlangıç',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    isBestseller: true,
    updatedAt: '2024-02-05'
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    title: 'İleri Seviye JavaScript ve React Tasarım Kalıpları',
    description: 'İleri seviye JavaScript kavramlarına, tasarım kalıplarına ve React en iyi uygulamalarına derinlemesine dalış',
    instructor: 'Davut Kaya',
    category: 'Yazılım',
    price: 54.99,
    originalPrice: 189.99,
    rating: 4.9,
    reviewCount: 4123,
    studentCount: 15600,
    duration: '36 saat',
    level: 'İleri',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    updatedAt: '2024-01-20'
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    title: 'Finansal Analiz ve Yatırım',
    description: 'Finansal modelleme, hisse analizi, portföy yönetimi ve yatırım stratejilerini öğrenin',
    instructor: 'Rıza Şahin',
    category: 'Finans',
    price: 64.99,
    originalPrice: 199.99,
    rating: 4.7,
    reviewCount: 3890,
    studentCount: 12400,
    duration: '30 saat',
    level: 'Orta',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    updatedAt: '2024-02-10'
  },
  {
    id: 'a7777777-7777-7777-7777-777777777777',
    title: 'Fotoğrafçılık Ustalık Sınıfı: Başlangıçtan Uzmanlığa',
    description: 'Kamera ayarları, kompozisyon, ışıklandırma ve Lightroom ile Photoshop\'ta rötuş işlemlerinde uzmanlaşın',
    instructor: 'Lale Yıldız',
    category: 'Fotoğrafçılık',
    price: 34.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviewCount: 7654,
    studentCount: 25300,
    duration: '24 saat',
    level: 'Başlangıç',
    thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=450&fit=crop',
    updatedAt: '2024-01-18'
  },
  {
    id: 'a8888888-8888-8888-8888-888888888888',
    title: 'İş Stratejisi ve Yönetimi',
    description: 'Stratejik planlama, liderlik, operasyon yönetimi ve iş büyütme stratejilerini öğrenin',
    instructor: 'Cemal Aydın',
    category: 'İşletme',
    price: 49.99,
    originalPrice: 159.99,
    rating: 4.6,
    reviewCount: 2987,
    studentCount: 11200,
    duration: '26 saat',
    level: 'Orta',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop',
    updatedAt: '2024-02-08'
  },
  {
    id: 'a9999999-9999-9999-9999-999999999999',
    title: 'Adobe Suite ile Temel Grafik Tasarımı',
    description: 'Profesyonel grafikler ve marka kimlikleri oluşturmak için Photoshop, Illustrator ve InDesign programlarını öğrenin',
    instructor: 'Nisa Kılıç',
    category: 'Tasarım',
    price: 39.99,
    originalPrice: 139.99,
    rating: 4.7,
    reviewCount: 5432,
    studentCount: 18700,
    duration: '28 saat',
    level: 'Başlangıç',
    thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=450&fit=crop',
    updatedAt: '2024-01-25'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000000',
    title: 'AWS ile Bulut Bilişim',
    description: 'AWS hizmetlerini, bulut mimarisini ve güvenliği öğrenerek AWS sertifikasyonuna hazırlanın',
    instructor: 'Kerem Polat',
    category: 'Yazılım',
    price: 69.99,
    originalPrice: 219.99,
    rating: 4.8,
    reviewCount: 4567,
    studentCount: 14800,
    duration: '44 saat',
    level: 'Orta',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    updatedAt: '2024-02-03'
  },
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    title: 'Metin Yazarlığı ve İçerik Üretimi',
    description: 'Dijital pazarlama için ikna edici yazarlık, SEO içerik üretimi ve hikaye anlatıcılığında uzmanlaşın',
    instructor: 'Ayşe Gül',
    category: 'Pazarlama',
    price: 29.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviewCount: 3210,
    studentCount: 9800,
    duration: '18 saat',
    level: 'Başlangıç',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop',
    updatedAt: '2024-01-30'
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    title: 'Siber Güvenliğin Temelleri',
    description: 'Ağ güvenliğini, etik hacklemeyi ve sistemleri siber tehditlerden korumayı öğrenin',
    instructor: 'Mert Tunç',
    category: 'Bilişim ve Güvenlik',
    price: 59.99,
    originalPrice: 189.99,
    rating: 4.9,
    reviewCount: 2876,
    studentCount: 8900,
    duration: '34 saat',
    level: 'Orta',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    isBestseller: true,
    updatedAt: '2024-02-12'
  }
];

export const categories = [
  'Tüm Kategoriler',
  'Yazılım',
  'Veri Bilimi',
  'Pazarlama',
  'Tasarım',
  'Finans',
  'Fotoğrafçılık',
  'İşletme',
  'Bilişim ve Güvenlik'
];

export const levels = ['Tüm Seviyeler', 'Başlangıç', 'Orta', 'İleri'];

export const priceRanges = [
  { label: 'Tüm Fiyatlar', min: 0, max: Infinity },
  { label: 'Ücretsiz', min: 0, max: 0 },
  { label: '50₺ Altı', min: 0, max: 49.99 },
  { label: '50₺ - 100₺', min: 50, max: 100 },
  { label: '100₺ Üzeri', min: 100, max: Infinity }
];
