import { likeService } from '../src/modules/like/like.service';
import { redis } from '../src/shared/config/redis';
import logger from '../src/shared/utils/logger';
import "dotenv/config";

/**
 * Like Cache Performance Test Script
 * 
 * Bu script like sisteminin Redis cache performansını test eder.
 */

async function testLikeCache() {
  console.log('🧪 Like Cache Test Başlıyor...\n');

  // Test kullanıcıları
  const testUser1 = '68efc58e7835830172c25685'; // sudem
  const testUser2 = '68f9ecd650db20cac80df7f4'; // aaaa
  const category = 'ROOMMATE';

  try {
    // ============================================
    // Test 1: Cache'siz isLiked kontrolü
    // ============================================
    console.log('📊 Test 1: Cache\'siz isLiked kontrolü\n');
    
    // Cache'i temizle
    await redis.flushdb();
    console.log('✅ Cache temizlendi\n');

    const start1 = Date.now();
    const isLiked1 = await likeService.isLiked(testUser1, testUser2, category);
    const time1 = Date.now() - start1;

    console.log(`Sonuç: ${isLiked1}`);
    console.log(`Süre: ${time1}ms (Database query)\n`);

    // ============================================
    // Test 2: Cache'li isLiked kontrolü
    // ============================================
    console.log('📊 Test 2: Cache\'li isLiked kontrolü\n');

    const start2 = Date.now();
    const isLiked2 = await likeService.isLiked(testUser1, testUser2, category);
    const time2 = Date.now() - start2;

    console.log(`Sonuç: ${isLiked2}`);
    console.log(`Süre: ${time2}ms (Redis cache)`);
    console.log(`⚡ Hız artışı: ${((time1 - time2) / time1 * 100).toFixed(1)}% daha hızlı\n`);

    // ============================================
    // Test 3: getUserLikes - Cache'siz
    // ============================================
    console.log('📊 Test 3: getUserLikes - Cache\'siz\n');

    // Cache'i temizle
    await redis.flushdb();

    const start3 = Date.now();
    const likes1 = await likeService.getUserLikes(testUser1);
    const time3 = Date.now() - start3;

    console.log(`Bulunan like sayısı: ${likes1.length}`);
    console.log(`Süre: ${time3}ms (Database query)\n`);

    // ============================================
    // Test 4: getUserLikes - Cache'li
    // ============================================
    console.log('📊 Test 4: getUserLikes - Cache\'li\n');

    const start4 = Date.now();
    const likes2 = await likeService.getUserLikes(testUser1);
    const time4 = Date.now() - start4;

    console.log(`Bulunan like sayısı: ${likes2.length}`);
    console.log(`Süre: ${time4}ms (Redis cache)`);
    console.log(`⚡ Hız artışı: ${((time3 - time4) / time3 * 100).toFixed(1)}% daha hızlı\n`);

    // ============================================
    // Test 5: getLikedByUsers - Cache'siz
    // ============================================
    console.log('📊 Test 5: getLikedByUsers - Cache\'siz\n');

    // Cache'i temizle
    await redis.flushdb();

    const start5 = Date.now();
    const likedBy1 = await likeService.getLikedByUsers(testUser1);
    const time5 = Date.now() - start5;

    console.log(`Bu kullanıcıyı beğenen: ${likedBy1.length} kişi`);
    console.log(`Süre: ${time5}ms (Database query)\n`);

    // ============================================
    // Test 6: getLikedByUsers - Cache'li
    // ============================================
    console.log('📊 Test 6: getLikedByUsers - Cache\'li\n');

    const start6 = Date.now();
    const likedBy2 = await likeService.getLikedByUsers(testUser1);
    const time6 = Date.now() - start6;

    console.log(`Bu kullanıcıyı beğenen: ${likedBy2.length} kişi`);
    console.log(`Süre: ${time6}ms (Redis cache)`);
    console.log(`⚡ Hız artışı: ${((time5 - time6) / time5 * 100).toFixed(1)}% daha hızlı\n`);

    // ============================================
    // Test 7: Like/Unlike ve Cache Invalidation
    // ============================================
    console.log('📊 Test 7: Like/Unlike ve Cache Invalidation\n');

    // Önce like
    console.log('Like yapılıyor...');
    const likeResult = await likeService.likeUser(testUser1, testUser2, category);
    console.log(`Sonuç: ${likeResult.success ? '✅' : '❌'} ${likeResult.message}\n`);

    // Cache'den kontrol
    const isLikedAfter = await likeService.isLiked(testUser1, testUser2, category);
    console.log(`isLiked kontrolü: ${isLikedAfter ? '✅ Beğenildi' : '❌ Beğenilmedi'}\n`);

    // Unlike
    console.log('Unlike yapılıyor...');
    const unlikeResult = await likeService.unlikeUser(testUser1, testUser2, category);
    console.log(`Sonuç: ${unlikeResult.success ? '✅' : '❌'} ${unlikeResult.message}\n`);

    // Cache'den tekrar kontrol
    const isLikedAfterUnlike = await likeService.isLiked(testUser1, testUser2, category);
    console.log(`isLiked kontrolü: ${isLikedAfterUnlike ? '✅ Beğenildi' : '❌ Beğenilmedi'}\n`);

    // ============================================
    // Redis İstatistikleri
    // ============================================
    console.log('📊 Redis İstatistikleri\n');

    const info = await redis.info('stats');
    const lines = info.split('\r\n');
    
    lines.forEach(line => {
      if (line.includes('total_commands_processed') || 
          line.includes('keyspace_hits') || 
          line.includes('keyspace_misses')) {
        console.log(`  ${line}`);
      }
    });

    console.log('\n✅ Tüm testler tamamlandı!');

  } catch (error) {
    console.error('❌ Test hatası:', error);
  } finally {
    // Cleanup
    await redis.quit();
    process.exit(0);
  }
}

testLikeCache();

