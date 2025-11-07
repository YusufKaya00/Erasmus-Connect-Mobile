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
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const profileItems = [
    { icon: 'mail', label: 'E-posta', value: user?.email },
    { icon: 'location', label: 'Hedef Ülke', value: profile?.destinationCountry?.name || '-' },
    { icon: 'location-outline', label: 'Hedef Şehir', value: profile?.destinationCity || '-' },
    { icon: 'school', label: 'Üniversite', value: profile?.homeUniversity || '-' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f0f9ff', '#ffffff', '#faf5ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Header */}
          <Card style={styles.headerCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {profile?.firstName?.[0] || 'U'}{profile?.lastName?.[0] || ''}
              </Text>
            </View>
            <Text style={styles.userName}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            {profile?.bio && (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}
          </Card>

          {/* Profile Info */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
            {profileItems.map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary[600]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value || '-'}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Actions */}
          <Card style={styles.card}>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="settings" size={24} color={colors.gray[700]} />
              <Text style={styles.actionText}>Ayarlar</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="help-circle" size={24} color={colors.gray[700]} />
              <Text style={styles.actionText}>Yardım</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <Ionicons name="information-circle" size={24} color={colors.gray[700]} />
              <Text style={styles.actionText}>Hakkında</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </Card>

          {/* Logout Button */}
          <Button
            title="Çıkış Yap"
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
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  userName: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.md,
  },
  logoutButton: {
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;

