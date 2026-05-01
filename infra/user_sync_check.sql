-- SmartLearn User Data Sync Check
-- Bu script, UserProfile (user-service) tablosunda olup 
-- User (auth-service) tablosunda eksik olan ID'leri tespit etmek içindir.

-- NOT: Mikroservis mimarisinde veritabanları ayrı olduğu için bu scripti 
-- her iki veritabanına da erişiminiz olan bir ortamda veya 
-- ID listelerini karşılaştırarak kullanmanız gerekir.

-- Hata tespit sorgusu (Eğer tablolar aynı DB'deyse):
/*
SELECT up.id, up.full_name, up.email 
FROM user_profiles up
LEFT JOIN users u ON up.id = u.id
WHERE u.id IS NULL;
*/

-- Eğer veritabanları ayrıyse (Docker/Postgres), şu ID'yi kontrol edin:
-- 66666666-6666-6666-6666-666666666666 (Harry Wilson)
-- Bu ID 'users' tablosunda yoksa ban işlemi 500 hatası verecektir.

-- Çözüm: Eksik kullanıcıyı auth-service veritabanına manuel eklemek veya 
-- sistemi temizleyip (clean install) yeniden başlatmak.
