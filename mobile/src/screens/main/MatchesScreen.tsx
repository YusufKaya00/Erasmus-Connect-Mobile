import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import matchService, { MatchCategory } from '../../services/match.service';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';

const MatchesScreen = () => {
  const [activeCategory, setActiveCategory] = useState<MatchCategory>('ROOMMATE');
  const [matches, setMatches] = useState<any[]>([]);
  const [likedUsers, setLikedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    fetchLikedUsers();
  }, [activeCategory]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await matchService.getMatches(activeCategory);
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Matches fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedUsers = async () => {
    try {
      const data = await matchService.getLikedProfiles();
      setLikedUsers(data || []);
    } catch (error) {
      console.error('Liked users fetch error:', error);
    }
  };

  const handleLike = async (userId: string) => {
    try {
      await matchService.likeProfile(userId, activeCategory);
      Alert.alert('Başarılı', 'Beğenildi!');
      fetchLikedUsers();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.error?.message || 'Bir hata oluştu');
    }
  };

  const categories = [
    { value: 'ROOMMATE' as MatchCategory, label: 'Ev Arkadaşı', icon: 'home' },
    { value: 'MENTOR' as MatchCategory, label: 'Mentor', icon: 'school' },
    { value: 'COMMUNICATION' as MatchCategory, label: 'Sosyalleşme', icon: 'people' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f0f9ff', '#ffffff', '#faf5ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Eşleşmeler 🤝</Text>
            <Text style={styles.subtitle}>Size uygun kişileri bulun</Text>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryTab,
                  activeCategory === cat.value && styles.categoryTabActive,
                ]}
                onPress={() => setActiveCategory(cat.value)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={activeCategory === cat.value ? colors.white : colors.primary[600]}
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === cat.value && styles.categoryTabTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Matches List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          ) : matches.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
                <Text style={styles.emptyText}>Henüz eşleşme bulunamadı</Text>
                <Text style={styles.emptySubtext}>
                  Profilinizi tamamlayarak daha fazla eşleşme alabilirsiniz
                </Text>
              </View>
            </Card>
          ) : (
            <View style={styles.matchesList}>
              {matches.map((match) => (
                <Card key={match.userId} style={styles.matchCard}>
                  <View style={styles.matchHeader}>
                    <View style={styles.matchAvatar}>
                      <Text style={styles.matchAvatarText}>
                        {match.profile?.first_name?.[0] || 'U'}
                      </Text>
                    </View>
                    <View style={styles.matchScoreBadge}>
                      <Text style={styles.matchScoreText}>{match.matchScore}%</Text>
                    </View>
                  </View>

                  <Text style={styles.matchName}>
                    {match.profile?.first_name} {match.profile?.last_name}
                  </Text>
                  <Text style={styles.matchLocation}>
                    📍 {match.profile?.destination_city || match.profile?.destination_country}
                  </Text>

                  {match.profile?.bio && (
                    <Text style={styles.matchBio} numberOfLines={2}>
                      {match.profile.bio}
                    </Text>
                  )}

                  <View style={styles.matchActions}>
                    <TouchableOpacity style={styles.matchButton}>
                      <Ionicons name="person" size={20} color={colors.white} />
                      <Text style={styles.matchButtonText}>Profil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.matchButton, styles.likeButton]}
                      onPress={() => handleLike(match.userId)}
                    >
                      <Ionicons name="heart" size={20} color={colors.white} />
                      <Text style={styles.matchButtonText}>Beğen</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  categoryTabs: {
    marginBottom: spacing.lg,
  },
  categoryTabsContent: {
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[200],
    gap: spacing.xs,
  },
  categoryTabActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  categoryTabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary[600],
  },
  categoryTabTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  matchesList: {
    gap: spacing.md,
  },
  matchCard: {
    position: 'relative',
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  matchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchAvatarText: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.success[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  matchScoreText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
  matchName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  matchLocation: {
    fontSize: fontSize.sm,
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  matchBio: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  matchActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  matchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  likeButton: {
    backgroundColor: colors.secondary[600],
  },
  matchButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
});

export default MatchesScreen;

