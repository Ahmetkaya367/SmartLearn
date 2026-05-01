-- SmartLearn Veri Temizleme ve Senkronizasyon Scripti
-- Bu script, testlerinizi sıfırdan yapabilmeniz için verileri stabil hale getirir.

-- 1. COURSE SERVICE (coursedb) - Kurs Durumlarını Sıfırla
-- Tüm kursları 'PENDING_APPROVAL' (Onay Bekliyor) durumuna çekelim ki 'Onayla/Approve' butonunu test edebilesiniz.
\c coursedb
UPDATE courses SET status = 'PENDING_APPROVAL', published = false WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE courses SET status = 'PENDING_APPROVAL', published = false WHERE id = '88888888-8888-8888-8888-888888888888';

-- 2. AUTH SERVICE (authdb) - Kullanıcı Durumlarını Aktifleştir
-- Banladığınız kullanıcıları geri açalım ki tekrar banlayabilin.
\c authdb
UPDATE users SET status = 'ACTIVE', active = true WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE users SET status = 'ACTIVE', active = true WHERE id = '66666666-6666-6666-6666-666666666666';

-- 3. USER SERVICE (userdb) - Profil Durumlarını Aktifleştir
\c userdb
UPDATE user_profiles SET status = 'ACTIVE' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE user_profiles SET status = 'ACTIVE' WHERE id = '66666666-6666-6666-6666-666666666666';

-- Bilgi: Bu scripti Postgres terminalinde 'psql -U smartuser -f infra/db_check_and_sync.sql' ile çalıştırabilirsiniz.
