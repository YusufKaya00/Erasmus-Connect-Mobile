import { createClient } from '@supabase/supabase-js';
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase URL veya Service Role Key eksik!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMatchPreferences() {
  try {
    console.log('🔍 Join sorununun kaynağını buluyoruz...\n');

    // Tek bir profil al ve detaylı kontrol et
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        has_returned_from_erasmus,
        match_preferences (
          id,
          profile_id,
          is_mentor,
          looking_for_mentor
        )
      `)
      .eq('user_id', '68efc58e7835830172c25685') // sudem cucemen
      .single();

    if (profileError) {
      console.error('❌ Profil alınırken hata:', profileError);
      return;
    }

    console.log('👤 Profil:', profile?.first_name, profile?.last_name);
    console.log('📝 Profile ID:', profile?.id);
    console.log('📋 Match Preferences:', JSON.stringify(profile?.match_preferences, null, 2));
    console.log('');

    // match_preferences'ı ayrı sorgula
    const { data: prefs, error: prefsError } = await supabase
      .from('match_preferences')
      .select('*')
      .eq('profile_id', profile?.id);

    if (prefsError) {
      console.error('❌ Match preferences alınırken hata:', prefsError);
      return;
    }

    console.log('🔍 Direkt match_preferences sorgusu:');
    console.log(JSON.stringify(prefs, null, 2));
    console.log('');

    // Şimdi mentorları farklı bir yöntemle çek
    console.log('🧪 Alternatif sorgu test ediliyor...\n');

    const { data: mentorProfiles, error: mentorError } = await supabase
      .from('match_preferences')
      .select(`
        *,
        profiles:profile_id (*)
      `)
      .eq('is_mentor', true);

    if (mentorError) {
      console.error('❌ Mentor sorgusu hatası:', mentorError);
    } else {
      console.log('✅ Alternatif sorgu ile bulunan mentorlar:', mentorProfiles?.length);
      
      if (mentorProfiles && mentorProfiles.length > 0) {
        console.log('\nMentorlar:');
        mentorProfiles.forEach((mentor: any) => {
          console.log(`  - ${mentor.profiles?.first_name} ${mentor.profiles?.last_name}`);
          console.log(`    Profile ID: ${mentor.profile_id}`);
          console.log(`    Has returned: ${mentor.profiles?.has_returned_from_erasmus}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

fixMatchPreferences();

