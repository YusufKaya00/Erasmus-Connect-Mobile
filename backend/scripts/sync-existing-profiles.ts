import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL veya Service Role Key eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncExistingProfiles() {
  try {
    console.log('🔄 Mevcut profil verilerini senkronize ediliyor...');

    // Önce countries tablosundaki ülkeleri al
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id, name, code')
      .eq('is_active', true);

    if (countriesError) {
      console.error('❌ Ülkeler alınırken hata:', countriesError.message);
      return;
    }

    console.log(`✅ ${countries?.length || 0} ülke bulundu`);

    // Profil verilerini al
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, destination_country_id, destination_city')
      .not('destination_country_id', 'is', null);

    if (profilesError) {
      console.error('❌ Profiller alınırken hata:', profilesError.message);
      return;
    }

    console.log(`📊 ${profiles?.length || 0} profil bulundu`);

    if (!profiles || profiles.length === 0) {
      console.log('ℹ️  Güncellenecek profil bulunamadı');
      return;
    }

    // Her profil için ülke bilgisini güncelle
    let updatedCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        // Şehir adına göre ülke bulma (basit mapping)
        const cityCountryMapping: Record<string, string> = {
          'Riga': 'Latvia',
          'riga': 'Latvia',
          'İstanbul': 'Turkey',
          'Istanbul': 'Turkey',
          'Akhisar': 'Turkey',
          // Daha fazla şehir eklenebilir
        };

        const countryName = cityCountryMapping[profile.destination_city];
        
        if (countryName) {
          // Ülke adına göre UUID bul
          const country = countries?.find(c => c.name === countryName);
          
          if (country) {
            // Profili güncelle
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ destination_country_id: country.id })
              .eq('id', profile.id);

            if (updateError) {
              console.error(`❌ Profil ${profile.user_id} güncellenirken hata:`, updateError.message);
              errorCount++;
            } else {
              console.log(`✅ Profil ${profile.user_id} güncellendi: ${profile.destination_city} → ${countryName}`);
              updatedCount++;
            }
          } else {
            console.warn(`⚠️  ${countryName} ülkesi Supabase'de bulunamadı`);
          }
        } else {
          console.warn(`⚠️  ${profile.destination_city} şehri için ülke mapping'i bulunamadı`);
        }

      } catch (error) {
        console.error(`❌ Profil ${profile.user_id} işlenirken hata:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Senkronizasyon Sonuçları:');
    console.log(`✅ Başarıyla güncellenen: ${updatedCount}`);
    console.log(`❌ Hata olan: ${errorCount}`);
    console.log(`📋 Toplam işlenen: ${profiles.length}`);

  } catch (error) {
    console.error('❌ Genel hata:', error);
    process.exit(1);
  }
}

syncExistingProfiles();
