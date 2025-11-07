import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * MongoDB ObjectId'yi Supabase UUID'sine çevirir
 * @param mongodbCountryId MongoDB'deki ülke ObjectId'si
 * @returns Supabase'deki ülke UUID'si
 */
export async function mapMongoCountryIdToSupabaseUUID(mongodbCountryId: string): Promise<string | null> {
  try {
    // MongoDB ObjectId formatını kontrol et
    if (!mongodbCountryId || typeof mongodbCountryId !== 'string') {
      return null;
    }

    // Eğer zaten UUID formatındaysa direkt döndür
    if (mongodbCountryId.length === 36 && mongodbCountryId.includes('-')) {
      return mongodbCountryId;
    }

    // MongoDB ObjectId ise, MongoDB'den ülke bilgisini al ve Supabase'de ara
    if (mongodbCountryId.length === 24) {
      // MongoDB bağlantısı gerekiyor - şimdilik basit mapping kullan
      console.log(`🔍 MongoDB ObjectId detected: ${mongodbCountryId}`);
      
      // Bu kısım için MongoDB'den ülke bilgisini almak gerekiyor
      // Şimdilik null döndür, frontend'den ülke adı/kodu gönderilmesini bekleyelim
      return null;
    }

    console.warn(`Unknown country ID format: ${mongodbCountryId}`);
    return null;

  } catch (error) {
    console.error('Error mapping country ID:', error);
    return null;
  }
}

/**
 * Supabase'deki ülke UUID'sini MongoDB ObjectId'sine çevirir
 * @param supabaseCountryUUID Supabase'deki ülke UUID'si
 * @returns MongoDB'deki ülke ObjectId'si
 */
export async function mapSupabaseUUIDToMongoCountryId(supabaseCountryUUID: string): Promise<string | null> {
  try {
    // Supabase'den ülke bilgisini al
    const { data: country, error } = await supabase
      .from('countries')
      .select('name, code')
      .eq('id', supabaseCountryUUID)
      .single();

    if (error || !country) {
      console.error('Error fetching country from Supabase:', error);
      return null;
    }

    // MongoDB'deki ülke ID'lerini Supabase UUID'leri ile eşleştiren mapping (ters)
    const reverseCountryMapping: Record<string, string> = {
      '68e63137f8270e7a0353ef7c': '507f1f77bcf86cd799439011', // Germany
      '68e6313df8270e7a0353ef89': '507f1f77bcf86cd799439012', // Spain
      '68e63136f8270e7a0353ef7b': '507f1f77bcf86cd799439013', // France
      // ... diğer ülkeler
    };

    return reverseCountryMapping[supabaseCountryUUID] || null;

  } catch (error) {
    console.error('Error mapping Supabase UUID to MongoDB ID:', error);
    return null;
  }
}

/**
 * MongoDB'deki ülke adına göre Supabase UUID'sini bulur
 * @param countryName Ülke adı
 * @returns Supabase'deki ülke UUID'si
 */
export async function getSupabaseCountryUUIDByName(countryName: string): Promise<string | null> {
  try {
    const { data: country, error } = await supabase
      .from('countries')
      .select('id')
      .eq('name', countryName)
      .single();

    if (error || !country) {
      console.error(`Country not found in Supabase: ${countryName}`, error);
      return null;
    }

    return country.id;

  } catch (error) {
    console.error('Error finding country by name:', error);
    return null;
  }
}

/**
 * MongoDB'deki ülke koduna göre Supabase UUID'sini bulur
 * @param countryCode Ülke kodu (örn: 'DE', 'TR')
 * @returns Supabase'deki ülke UUID'si
 */
export async function getSupabaseCountryUUIDByCode(countryCode: string): Promise<string | null> {
  try {
    const { data: country, error } = await supabase
      .from('countries')
      .select('id')
      .eq('code', countryCode)
      .single();

    if (error || !country) {
      console.error(`Country not found in Supabase: ${countryCode}`, error);
      return null;
    }

    return country.id;

  } catch (error) {
    console.error('Error finding country by code:', error);
    return null;
  }
}
