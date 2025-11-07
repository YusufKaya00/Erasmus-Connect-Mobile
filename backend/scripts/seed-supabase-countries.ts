import { createClient } from '@supabase/supabase-js';
import { erasmusCountries } from '../prisma/countries-data';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL veya Service Role Key eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedSupabaseCountries() {
  try {
    console.log('🌍 Supabase countries tablosuna ülke verileri ekleniyor...');

    // Önce countries tablosunun var olup olmadığını kontrol et
    const { error: tableError } = await supabase
      .from('countries')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('⚠️  Countries tablosu bulunamadı. Önce tabloyu oluşturmanız gerekiyor.');
      console.log('📋 Supabase Dashboard > SQL Editor\'de şu SQL\'i çalıştırın:');
      console.log('\n' + '='.repeat(60));
      console.log(`
-- Countries tablosu oluşturma SQL'i
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  continent VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  flag VARCHAR(10),
  timezone VARCHAR(100),
  currency VARCHAR(10),
  languages TEXT[] DEFAULT '{}',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON countries(is_active);
      `);
      console.log('='.repeat(60));
      console.log('\nTabloyu oluşturduktan sonra bu script\'i tekrar çalıştırın.');
      return;
    }

    // Önce mevcut verileri kontrol et
    const { data: existingCountries } = await supabase
      .from('countries')
      .select('id, name')
      .limit(5);

    if (existingCountries && existingCountries.length > 0) {
      console.log('✅ Countries tablosu zaten dolu. Güncelleme yapılıyor...');
      
      // Mevcut verileri güncelle
      for (const country of erasmusCountries) {
        const { error } = await supabase
          .from('countries')
          .upsert({
            name: country.name,
            code: country.code,
            continent: country.continent,
            latitude: country.latitude,
            longitude: country.longitude,
            flag: country.flag,
            timezone: country.timezone,
            currency: country.currency,
            languages: country.languages,
            description: country.description,
            is_active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'code' // code alanına göre conflict resolution
          });

        if (error) {
          console.error(`❌ ${country.name} güncellenirken hata:`, error.message);
        } else {
          console.log(`✅ ${country.name} güncellendi`);
        }
      }
    } else {
      console.log('📝 Yeni ülke verileri ekleniyor...');
      
      // Yeni verileri ekle
      const { error } = await supabase
        .from('countries')
        .insert(erasmusCountries.map(country => ({
          name: country.name,
          code: country.code,
          continent: country.continent,
          latitude: country.latitude,
          longitude: country.longitude,
          flag: country.flag,
          timezone: country.timezone,
          currency: country.currency,
          languages: country.languages,
          description: country.description,
          is_active: true
        })));

      if (error) {
        console.error('❌ Ülke verileri eklenirken hata:', error.message);
        process.exit(1);
      }

      console.log('✅ Tüm ülke verileri başarıyla eklendi!');
    }

    // Sonuçları kontrol et
    const { data: countries, error: countError } = await supabase
      .from('countries')
      .select('id, name, code')
      .eq('is_active', true);

    if (countError) {
      console.error('❌ Sonuç kontrolü hatası:', countError.message);
    } else {
      console.log(`🎉 Toplam ${countries?.length || 0} ülke Supabase'de mevcut`);
    }

  } catch (error) {
    console.error('❌ Genel hata:', error);
    process.exit(1);
  }
}

seedSupabaseCountries();
