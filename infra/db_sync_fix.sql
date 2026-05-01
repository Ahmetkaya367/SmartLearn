-- SmartLearn Database Synchronization Script
-- Bu script, Entity sınıflarındaki yeni alanları ve isim değişikliklerini 
-- mevcut PostgreSQL veritabanları ile senkronize etmek için kullanılır.

-- ==========================================
-- 1. COURSE SERVICE (coursedb)
-- ==========================================
\c coursedb

-- 'published' kolonu zaten eklenmiş olabilir, kontrol ederek ekleyelim
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='published') THEN
        ALTER TABLE courses ADD COLUMN published BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 'original_price' kolonunu ekleyelim
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='original_price') THEN
        ALTER TABLE courses ADD COLUMN original_price DECIMAL(10, 2);
    END IF;
END $$;

-- ==========================================
-- 2. USER SERVICE (userdb)
-- ==========================================
\c userdb

-- 'messages' tablosundaki isimlendirme uyumsuzluklarını düzeltelim
-- Not: Mevcut verileri korumak için RENAME kullanıyoruz
DO $$ 
BEGIN 
    -- 'created_at' yerine 'sentAt' kullanılıyorsa (eski entity yapısı)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='sent_at') THEN
        ALTER TABLE messages RENAME COLUMN sent_at TO created_at;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='created_at') THEN
        ALTER TABLE messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- 'is_read' kontrolü
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='read') THEN
        ALTER TABLE messages RENAME COLUMN "read" TO is_read;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_read') THEN
        ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
