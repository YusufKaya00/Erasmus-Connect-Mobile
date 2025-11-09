import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import routeService from '../../services/route.service';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';

const TravelRoutesScreen = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await routeService.getAll();
      setRoutes(data || []);
    } catch (error) {
      console.error('Routes fetch error:', error);
      Alert.alert('Error', 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f0f9ff', '#ffffff', '#faf5ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Travel Routes 🗺️</Text>
              <Text style={styles.subtitle}>Share your Erasmus journey, discover routes from others</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="navigate" size={24} color={colors.primary[600]} />
              </View>
              <Text style={styles.statValue}>{routes.length}</Text>
              <Text style={styles.statLabel}>Total Routes</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={24} color={colors.secondary[600]} />
              </View>
              <Text style={styles.statValue}>
                {routes.reduce((acc, r) => acc + (r.viewCount || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="chatbubble" size={24} color={colors.success[600]} />
              </View>
              <Text style={styles.statValue}>
                {routes.reduce((acc, r) => acc + (r._count?.comments || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
          </View>

          {/* Routes List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={styles.loadingText}>Loading routes...</Text>
            </View>
          ) : routes.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <Ionicons name="navigate-outline" size={64} color={colors.gray[400]} />
                <Text style={styles.emptyText}>No routes shared yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to share a route and help other Erasmus students!
                </Text>
                <TouchableOpacity style={styles.createButton}>
                  <Ionicons name="add" size={16} color={colors.white} />
                  <Text style={styles.createButtonText}>Create First Route</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            routes.map((route) => (
              <TouchableOpacity key={route.id} activeOpacity={0.7}>
                <Card style={styles.routeCard}>
                  {/* Map Visual */}
                  <View style={styles.mapVisual}>
                    <LinearGradient
                      colors={['#60A5FA', '#A78BFA', '#F472B6']}
                      style={styles.mapGradient}
                    >
                      <View style={styles.mapContent}>
                        <Ionicons name="location" size={32} color={colors.white} />
                        <View style={styles.routeLocations}>
                          <Text style={styles.location} numberOfLines={1}>{route.startLocation}</Text>
                          <Ionicons name="arrow-forward" size={16} color={colors.white} />
                          <Text style={styles.location} numberOfLines={1}>{route.endLocation}</Text>
                        </View>
                      </View>
                      {route.googleMapsUrl && (
                        <View style={styles.mapsButton}>
                          <Ionicons name="map" size={12} color={colors.primary[600]} />
                          <Text style={styles.mapsButtonText}>Maps</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </View>

                  {/* Route Info */}
                  <View style={styles.routeContent}>
                    <Text style={styles.routeTitle} numberOfLines={2}>{route.title}</Text>
                    
                    {route.description && (
                      <Text style={styles.routeDescription} numberOfLines={2}>
                        {route.description}
                      </Text>
                    )}

                    {/* User Info */}
                    {route.user && (
                      <View style={styles.userInfo}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.userAvatarText}>
                            {route.user.profile?.firstName?.[0] || 'U'}
                          </Text>
                        </View>
                        <View style={styles.userDetails}>
                          <Text style={styles.userName}>
                            {route.user.profile?.firstName} {route.user.profile?.lastName}
                          </Text>
                          <Text style={styles.routeDate}>
                            {new Date(route.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Stats */}
                    <View style={styles.routeStats}>
                      <View style={styles.routeStat}>
                        <Ionicons name="eye" size={14} color={colors.gray[500]} />
                        <Text style={styles.routeStatText}>{route.viewCount || 0}</Text>
                      </View>
                      <View style={styles.routeStat}>
                        <Ionicons name="chatbubble" size={14} color={colors.gray[500]} />
                        <Text style={styles.routeStatText}>{route._count?.comments || 0}</Text>
                      </View>
                      <View style={styles.routeStat}>
                        <Ionicons name="calendar" size={14} color={colors.gray[500]} />
                        <Text style={styles.routeStatText}>
                          {new Date(route.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>

                    {/* View Details Link */}
                    <View style={styles.viewDetails}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.primary[600]} />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: spacing.xxl * 2,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: colors.textSecondary,
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
    paddingHorizontal: spacing.md,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  createButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.white,
  },
  routeCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  mapVisual: {
    height: 150,
  },
  mapGradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeLocations: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  location: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 100,
  },
  mapsButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  mapsButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary[600],
  },
  routeContent: {
    padding: spacing.md,
  },
  routeTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  routeDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  routeDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  routeStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: fontSize.xs,
    color: colors.gray[600],
    fontWeight: '500',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    gap: spacing.xs,
  },
  viewDetailsText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary[600],
  },
});

export default TravelRoutesScreen;

