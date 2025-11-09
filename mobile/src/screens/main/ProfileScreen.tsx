import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';

const ProfileScreen = () => {
  const { user, profile, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f0f9ff', '#ffffff', '#faf5ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={24} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  {profile?.firstName?.[0] || 'U'}{profile?.lastName?.[0] || ''}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
                <Text style={styles.userLocation}>
                  {profile?.destinationCity}, {profile?.destinationCountry?.name}
                </Text>
              </View>
            </View>

            {profile?.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bio}>{profile.bio}</Text>
              </View>
            )}
          </Card>

          {/* Contact Information */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person" size={20} color={colors.primary[600]} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={18} color={colors.gray[500]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
              {profile?.phone && (
                <View style={styles.infoItem}>
                  <Ionicons name="call" size={18} color={colors.gray[500]} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>
                      {profile.phoneCountryCode} {profile.phone}
                    </Text>
                  </View>
                </View>
              )}
              {profile?.gender && (
                <View style={styles.infoItem}>
                  <Ionicons name="person" size={18} color={colors.gray[500]} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{profile.gender}</Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Erasmus Information */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="globe" size={20} color={colors.primary[600]} />
              <Text style={styles.sectionTitle}>Erasmus Information</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={18} color={colors.gray[500]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Destination</Text>
                  <Text style={styles.infoValue}>
                    {profile?.destinationCity}, {profile?.destinationCountry?.name}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={18} color={colors.gray[500]} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Academic Term</Text>
                  <Text style={styles.infoValue}>
                    {profile?.academicTerm} {profile?.academicYear}
                  </Text>
                </View>
              </View>
              {profile?.hasReturnedFromErasmus && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✓ Experienced - Can provide mentorship</Text>
                </View>
              )}
            </View>
          </Card>

          {/* University Information */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="school" size={20} color={colors.primary[600]} />
              <Text style={styles.sectionTitle}>University</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Home University</Text>
                  <Text style={styles.infoValue}>{profile?.homeUniversity || 'Not specified'}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Host University</Text>
                  <Text style={styles.infoValue}>{profile?.destinationUniversity || 'Not specified'}</Text>
                </View>
              </View>
              {profile?.fieldOfStudy && (
                <View style={styles.infoItem}>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Field of Study</Text>
                    <Text style={styles.infoValue}>{profile.fieldOfStudy}</Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Interests & Languages */}
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart" size={20} color={colors.primary[600]} />
              <Text style={styles.sectionTitle}>Interests & Languages</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.tagSection}>
                <Text style={styles.tagTitle}>Interests</Text>
                <View style={styles.tagList}>
                  {profile?.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest: string, idx: number) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{interest}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No interests added</Text>
                  )}
                </View>
              </View>
              <View style={styles.tagSection}>
                <Text style={styles.tagTitle}>Languages</Text>
                <View style={styles.tagList}>
                  {profile?.languages && profile.languages.length > 0 ? (
                    profile.languages.map((lang: string, idx: number) => (
                      <View key={idx} style={[styles.tag, styles.languageTag]}>
                        <Text style={[styles.tagText, styles.languageTagText]}>{lang.toUpperCase()}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No languages added</Text>
                  )}
                </View>
              </View>
              {profile?.lookingForRoommate && (
                <View style={styles.roommateBadge}>
                  <Text style={styles.roommateText}>🏠 Looking for a roommate</Text>
                </View>
              )}
            </View>
          </Card>

          {/* Actions */}
          <Card style={styles.card}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="settings-outline" size={24} color={colors.gray[700]} />
              <Text style={styles.actionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="help-circle-outline" size={24} color={colors.gray[700]} />
              <Text style={styles.actionText}>Help</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="information-circle-outline" size={24} color={colors.gray[700]} />
              <Text style={styles.actionText}>About</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </Card>

          {/* Logout Button */}
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userLocation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  bioContainer: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: fontSize.sm * 1.5,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  infoList: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.success[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.success[700],
  },
  tagSection: {
    gap: spacing.sm,
  },
  tagTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary[700],
  },
  languageTag: {
    backgroundColor: colors.secondary[100],
  },
  languageTagText: {
    color: colors.secondary[700],
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  roommateBadge: {
    backgroundColor: colors.warning[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  roommateText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.warning[700],
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  actionText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
  },
  logoutButton: {
    marginBottom: spacing.xxl,
  },
});

export default ProfileScreen;
