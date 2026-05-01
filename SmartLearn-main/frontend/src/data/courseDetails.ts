export interface CourseSection {
  id: string;
  title: string;
  orderIndex: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz';
  isPreview?: boolean;
}

export interface CourseReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface CourseDetail {
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
  thumbnail: string;
  image?: string;
  duration: string;
  updatedAt: string;
  videoPreviewUrl: string;
  longDescription: string;
  learningOutcomes: string[];
  whatYouWillLearn?: string[]; // Alias for learningOutcomes
  requirements: string[];
  targetAudience: string[];
  sections: CourseSection[];
  curriculum?: CourseSection[]; // Alias for sections
  instructorBio: string;
  instructorImage: string;
  instructorTitle: string;
  instructorStudents: number;
  instructorCourses: number;
  instructorRating: number;
  reviews: CourseReview[];
  language: string;
  lastUpdated: string;
  certificateIncluded: boolean;
  status?: string;
}

export const courseDetails: Record<string, CourseDetail> = {
  'a1111111-1111-1111-1111-111111111111': {
    id: 'a1111111-1111-1111-1111-111111111111',
    videoPreviewUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    longDescription: `Bu kapsamlı eğitim kampı sizi sıfırdan profesyonel bir web geliştiricisine dönüştürecek. Duyarlı web siteleri, web uygulamaları ve tam kapsamlı (full-stack) projeler inşa ederek öğreneceksiniz.

Eğitim, HTML ve CSS'in temellerinden başlayıp React Hooks, Node.js API'leri ve veritabanı entegrasyonu gibi ileri seviye konulara kadar modern web geliştirme hakkında bilmeniz gereken her şeyi kapsar. Her bölüm, öğreniminizi pekiştirecek uygulamalı projeler içerir.

Bu kursun sonunda, profesyonel bir proje portföyüne ve hayal ettiğiniz herhangi bir web uygulamasını oluşturacak becerilere sahip olacaksınız.`,
    learningOutcomes: [
      'HTML5, CSS3 ve modern CSS framework\'leri ile duyarlı web siteleri oluşturun',
      'JavaScript ES6+ özelliklerinde uzmanlaşın ve temiz, verimli kod yazın',
      'React ve state (durum) yönetimi ile etkileşimli kullanıcı arayüzleri oluşturun',
      'Node.js ve Express ile RESTful API\'ler geliştirin',
      'MongoDB ve SQL dahil olmak üzere veritabanlarıyla çalışın',
      'Web uygulamalarını canlı (production) ortamlara dağıtın',
      'Kimlik doğrulama ve yetkilendirme sistemleri uygulayın',
      'Web geliştirme en iyi uygulamalarını ve tasarım kalıplarını takip edin'
    ],
    requirements: [
      'Bir bilgisayar (Windows, Mac veya Linux)',
      'Önceden programlama deneyimi gerekmez',
      'Öğrenme ve kodlama pratiği yapma isteği',
      'Video dersler için istikrarlı bir internet bağlantısı'
    ],
    targetAudience: [
      'Web geliştirme öğrenmek isteyen yeni başlayanlar',
      'Kariyer değiştirip teknoloji sektörüne girmek isteyenler',
      'Modern teknolojilerle yeteneklerini güncellemek isteyen geliştiriciler',
      'Kendi web uygulamalarını kurmak isteyen girişimciler'
    ],
    sections: [
      {
        id: '51111111-1111-1111-1111-111111111111',
        title: 'Giriş & Kurulum',
        lessons: [
          { id: '11111111-0000-0000-0000-000000000001', title: 'Kursa Hoş Geldiniz', duration: '5:32', type: 'video', isPreview: true },
          { id: '11111111-0000-0000-0000-000000000002', title: 'Kursa Genel Bakış & Neler Geliştireceğiz?', duration: '8:15', type: 'video', isPreview: true },
          { id: '11111111-0000-0000-0000-000000000003', title: 'Geliştirme Ortamınızın Kurulumu', duration: '12:45', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000004', title: 'VS Code ve Eklentilerin Kurulumu', duration: '10:20', type: 'video' }
        ]
      },
      {
        id: '51111111-1111-1111-1111-111111111112',
        title: 'HTML Temelleri',
        lessons: [
          { id: '11111111-0000-0000-0000-000000000005', title: 'HTML Temelleri & Belge Yapısı', duration: '15:30', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000006', title: 'Metin Elementleri & Biçimlendirme', duration: '12:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000007', title: 'Linkler, Görseller ve Medya', duration: '18:20', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000008', title: 'Listeler ve Tablolar', duration: '14:10', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000009', title: 'Formlar ve Girdi (Input) Elementleri', duration: '20:45', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000010', title: 'HTML5 Semantik Öğeleri', duration: '16:30', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000011', title: 'HTML Sınavı', duration: '10:00', type: 'quiz' }
        ]
      },
      {
        id: '51111111-1111-1111-1111-111111111113',
        title: 'CSS Stilleri & Düzenleri',
        lessons: [
          { id: '11111111-0000-0000-0000-000000000012', title: 'CSS Temelleri', duration: '22:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000013', title: 'Seçiciler ve Özgüllük (Specificity)', duration: '18:40', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000014', title: 'Kutu (Box) Modeli ve Konumlandırma', duration: '25:30', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000015', title: 'Flexbox Düzeni', duration: '28:20', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000016', title: 'CSS Grid', duration: '30:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000017', title: 'Duyarlı (Responsive) Tasarım & Medya Sorguları', duration: '24:50', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000018', title: 'CSS Animasyonları & Geçişler (Transitions)', duration: '20:10', type: 'video' }
        ]
      },
      {
        id: '51111111-1111-1111-1111-111111111114',
        title: 'JavaScript Temelleri',
        lessons: [
          { id: '11111111-0000-0000-0000-000000000019', title: 'JavaScript Başlangıç', duration: '26:30', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000020', title: 'Değişkenler, Veri Tipleri ve Operatörler', duration: '22:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000021', title: 'Fonksiyonlar ve Kapsam (Scope)', duration: '28:40', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000022', title: 'Diziler (Arrays) ve Nesneler (Objects)', duration: '30:20', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000023', title: 'DOM Manipülasyonu', duration: '32:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000024', title: 'Olaylar (Events) ve Olay İşleme', duration: '25:50', type: 'video' }
        ]
      },
      {
        id: '51111111-1111-1111-1111-111111111115',
        title: 'Modern JavaScript (ES6+)',
        lessons: [
          { id: '11111111-0000-0000-0000-000000000025', title: 'Ok (Arrow) Fonksiyonları', duration: '18:20', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000026', title: 'Destructuring ve Spread Operatörü', duration: '20:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000027', title: 'Promise\'ler ve Async/Await', duration: '28:30', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000028', title: 'Modüller (Modules) ve İçe Aktarma (Imports)', duration: '16:40', type: 'video' }
        ]
      },
      {
        id: '51111111-1111-1111-1111-111111111116',
        title: 'React Temelleri',
        lessons: [
          { id: '11111111-0000-0000-0000-000000000029', title: 'React\'e Giriş', duration: '15:20', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000030', title: 'Bileşenler (Components) ve Props', duration: '24:15', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000031', title: 'State Yönetimi ve Hook\'lar', duration: '30:40', type: 'video' },
          { id: '11111111-0000-0000-0000-000000000032', title: 'İlk React Uygulamanızı Geliştirme', duration: '45:20', type: 'video' }
        ]
      }
    ],
    instructorBio: `Seda Yılmaz, 10 yılı aşkın web geliştirme deneyimine sahip kıdemli bir yazılım mühendisidir. Google ve Airbnb dahil olmak üzere önde gelen teknoloji şirketlerinde çalışmış, frontend geliştirme ekiplerini yönetmiş ve yeni başlayan geliştiricilere mentorluk yapmıştır.
    
Seda, öğretme konusunda tutkuludur ve binlerce öğrencinin web geliştirme alanında başarılı kariyerlere geçiş yapmasına yardımcı olmuştur. Öğretim stili, öğrencileri iş piyasasına hazırlayan gerçek dünya projeleriyle pratik, uygulamalı öğrenmeye odaklanır.`,
    instructorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    instructorTitle: 'Kıdemli Yazılım Mühendisi & Web Geliştirme Eğitmeni',
    instructorStudents: 87450,
    instructorCourses: 5,
    instructorRating: 4.8,
    reviews: [
      {
        id: '61111111-1111-1111-1111-111111111111',
        userName: 'Murat Çelik',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        rating: 5,
        date: '2024-02-10',
        comment: 'Bu kurs tüm beklentilerimi aştı! Seda, karmaşık kavramları basit, anlaşılması kolay bir şekilde açıklayan inanılmaz bir eğitmen. Projeler pratik ve gerçek dünya projeleriyle alakalı. Bu kursu tamamladıktan 3 ay sonra ilk web dev işime girdim!'
      },
      {
        id: '61111111-1111-1111-1111-111111111112',
        userName: 'Zeynep Kaya',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        rating: 5,
        date: '2024-02-08',
        comment: 'Aldığım en iyi web geliştirme kursu. Müfredat, temellerden başlayıp kademeli olarak ileri düzey konulara doğru ilerleyecek şekilde çok iyi yapılandırılmış. Sadece React bölümü bile kursun tüm fiyatına değdi. Web geliştirmeyi öğrenme konusunda ciddi olan herkese şiddetle tavsiye edilir.'
      },
      {
        id: '61111111-1111-1111-1111-111111111113',
        userName: 'Davut Park',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        rating: 4,
        date: '2024-02-05',
        comment: 'Genel olarak harika bir kurs! İçerik kapsamlı ve güncel. Tek önerim daha gelişmiş React kalıpları eklemek olurdu, ama bu tamamen detaya inmek olur. Eğitmen harika ve topluluk desteği mükemmel.'
      },
      {
        id: '61111111-1111-1111-1111-111111111114',
        userName: 'Leyla Anderson',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
        rating: 5,
        date: '2024-02-01',
        comment: 'Sıfır kodlama bilgisinden sadece 3 ayda full-stack uygulamalar oluşturmaya geçtim. Seda\'nın öğretim stili yeni başlayanlar için mükemmel - açık, sabırlı ve cesaret verici. Uygulamalı projeler bana işverenleri etkileyen bir portföy kazandırdı. Teşekkürler!'
      },
      {
        id: '61111111-1111-1111-1111-111111111115',
        userName: 'Cem Yıldırım',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        rating: 5,
        date: '2024-01-28',
        comment: 'Olağanüstü bir kurs! Çeşitli çevrimiçi web dev kurslarını denedim ve bu açık ara en iyisi. Açıklamalar çok net, ilerleme hızı mükemmel ve projeler zorlu ama başarılabilir. Verdiğiniz her kuruşa değer.'
      }
    ],
    language: 'Türkçe',
    lastUpdated: 'Ocak 2024',
    certificateIncluded: true
  }
};
