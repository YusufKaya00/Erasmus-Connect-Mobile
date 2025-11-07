import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL veya Service Role Key eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMentors() {
  try {
    console.log('🔍 Mentor sistemini kontrol ediyoruz...\n');

    // 1. Tüm profilleri kontrol et
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, destination_country_id, has_returned_from_erasmus')
      .not('destination_country_id', 'is', null);

    if (profilesError) {
      console.error('❌ Profiller alınırken hata:', profilesError.message);
      return;
    }

    console.log(`📊 Toplam profil sayısı: ${allProfiles?.length || 0}`);
    console.log(`   - has_returned_from_erasmus = true: ${allProfiles?.filter(p => p.has_returned_from_erasmus).length || 0}`);
    console.log(`   - has_returned_from_erasmus = false: ${allProfiles?.filter(p => !p.has_returned_from_erasmus).length || 0}\n`);

    // 2. match_preferences tablosunu kontrol et
    const { data: allMatchPrefs, error: allPrefsError } = await supabase
      .from('match_preferences')
      .select('profile_id, is_mentor, looking_for_mentor');

    if (allPrefsError) {
      console.error('❌ Match preferences alınırken hata:', allPrefsError.message);
    } else {
      console.log(`⚙️  Toplam match_preferences kayıt sayısı: ${allMatchPrefs?.length || 0}`);
      
      const mentorCount = allMatchPrefs?.filter(p => p.is_mentor === true).length || 0;
      const lookingForMentorCount = allMatchPrefs?.filter(p => p.looking_for_mentor === true).length || 0;
      
      console.log(`   - is_mentor = true: ${mentorCount}`);
      console.log(`   - looking_for_mentor = true: ${lookingForMentorCount}\n`);
    }

    // 3. Mentor olarak işaretlenmiş kullanıcıları detaylı göster
    const { data: mentorPrefs, error: mentorPrefsError } = await supabase
      .from('match_preferences')
      .select('profile_id, is_mentor, looking_for_mentor')
      .eq('is_mentor', true);

    if (mentorPrefsError) {
      console.error('❌ Mentor preferences alınırken hata:', mentorPrefsError.message);
    } else if (mentorPrefs && mentorPrefs.length > 0) {
      console.log('🎓 Mentor olarak işaretlenmiş kullanıcılar:\n');
      
      for (const pref of mentorPrefs) {
        const profile = allProfiles?.find(p => p.id === pref.profile_id);
        if (profile) {
          console.log(`  👤 ${profile.first_name} ${profile.last_name}`);
          console.log(`     User ID: ${profile.user_id}`);
          console.log(`     Ülke: ${profile.destination_country_id}`);
          console.log(`     Erasmus'tan Döndü: ${profile.has_returned_from_erasmus ? '✅' : '❌'}`);
          console.log(`     is_mentor: ${pref.is_mentor ? '✅' : '❌'}`);
          console.log('');
        }
      }
    } else {
      console.log('⚠️  Hiç mentor olarak işaretlenmiş kullanıcı yok!\n');
    }

    // 4. Ülke bazında istatistik
    const countryStats: { [key: string]: { total: number, hasReturned: number, mentors: number } } = {};
    
    if (allProfiles && allMatchPrefs) {
      allProfiles.forEach(profile => {
        const country = profile.destination_country_id;
        if (!countryStats[country]) {
          countryStats[country] = { total: 0, hasReturned: 0, mentors: 0 };
        }
        countryStats[country].total++;
        if (profile.has_returned_from_erasmus) {
          countryStats[country].hasReturned++;
        }
        
        const pref = allMatchPrefs.find(p => p.profile_id === profile.id);
        if (pref?.is_mentor) {
          countryStats[country].mentors++;
        }
      });
    }

    console.log('🌍 Ülke bazında mentor istatistikleri:\n');
    Object.entries(countryStats).forEach(([country, stats]) => {
      console.log(`  ${country}:`);
      console.log(`    Toplam kullanıcı: ${stats.total}`);
      console.log(`    Erasmus'tan dönenler: ${stats.hasReturned}`);
      console.log(`    Mentor sayısı: ${stats.mentors}`);
      console.log('');
    });

    // 5. Test sorgusu - Mevcut match.service.ts'deki sorgu
    console.log('🧪 Test Sorgusu: match.service.ts\'deki mentor sorgusu simülasyonu\n');
    
    if (allProfiles && allProfiles.length > 0) {
      const testUser = allProfiles[0];
      console.log(`Test kullanıcısı: ${testUser.first_name} ${testUser.last_name}`);
      console.log(`Hedef ülke: ${testUser.destination_country_id}\n`);
      
      const { data: candidates, error: candidatesError } = await supabase
        .from('profiles')
        .select(`
          *,
          match_preferences (*)
        `)
        .neq('user_id', testUser.user_id)
        .eq('destination_country_id', testUser.destination_country_id)
        .eq('has_returned_from_erasmus', true)
        .not('destination_country_id', 'is', null);

      if (candidatesError) {
        console.error('❌ Adaylar alınırken hata:', candidatesError.message);
      } else {
        console.log(`✅ Sorgu sonucu: ${candidates?.length || 0} aday bulundu`);
        
        if (candidates && candidates.length > 0) {
          const mentors = candidates.filter(candidate => {
            const prefs = candidate.match_preferences;
            const isMentor = prefs?.is_mentor === true;
            console.log(`     ${candidate.first_name}: prefs=${!!prefs}, is_mentor=${isMentor}`);
            return isMentor;
          });
          
          console.log(`✅ Bunlardan ${mentors.length} tanesi mentor\n`);
          
          if (mentors.length > 0) {
            console.log('Mentor adayları:');
            mentors.forEach(mentor => {
              console.log(`  - ${mentor.first_name} ${mentor.last_name}`);
            });
          }
        } else {
          console.log('⚠️  Hiç aday bulunamadı!');
          console.log('   Sebepleri:');
          console.log('   1. Aynı ülkeye giden başka kullanıcı yok');
          console.log('   2. has_returned_from_erasmus = true olan kullanıcı yok');
          console.log('   3. is_mentor = true olan kullanıcı yok\n');
        }
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

checkMentors();

