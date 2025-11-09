import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import countryService from '../../services/country.service';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';

const CountriesScreen = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = countries.filter((country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchQuery, countries]);

  const fetchCountries = async () => {
    try {
      const data = await countryService.getAllCountries();
      setCountries(data || []);
      setFilteredCountries(data || []);
    } catch (error) {
      console.error('Countries fetch error:', error);
      Alert.alert('Error', 'Failed to load countries');
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
            <Text style={styles.title}>Erasmus Countries 🌍</Text>
            <Text style={styles.subtitle}>Explore countries and learn from experiences</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries... 🔍"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray[400]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={styles.loadingText}>Loading countries...</Text>
            </View>
          ) : filteredCountries.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContainer}>
                <Ionicons name="earth-outline" size={64} color={colors.gray[400]} />
                <Text style={styles.emptyText}>No countries found</Text>
                <Text style={styles.emptySubtext}>Try a different search</Text>
              </View>
            </Card>
          ) : (
            filteredCountries.map((country) => (
              <TouchableOpacity key={country.id} activeOpacity={0.7}>
                <Card style={styles.countryCard}>
                  {/* Header Bar */}
                  <View style={styles.countryHeaderBar} />
                  
                  {/* Content */}
                  <View style={styles.countryContent}>
                    <View style={styles.countryHeader}>
                      <Text style={styles.countryFlag}>{country.flag || '🌍'}</Text>
                      <View style={styles.countryInfo}>
                        <Text style={styles.countryName}>{country.name}</Text>
                        <Text style={styles.countryContinent}>{country.continent}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color={colors.primary[600]} />
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Ionicons name="people" size={16} color={colors.primary[600]} />
                        <Text style={styles.statLabel}>Active Students</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="document-text" size={16} color={colors.success[600]} />
                        <Text style={styles.statLabel}>Posts</Text>
                      </View>
                    </View>

                    {/* Languages */}
                    {country.languages && country.languages.length > 0 && (
                      <View style={styles.languagesSection}>
                        <Text style={styles.languagesTitle}>Languages Spoken:</Text>
                        <View style={styles.countryLanguages}>
                          {country.languages.slice(0, 3).map((lang: string, idx: number) => (
                            <Text key={idx} style={styles.languageTag}>
                              {lang.toUpperCase()}
                            </Text>
                          ))}
                          {country.languages.length > 3 && (
                            <Text style={styles.moreLanguages}>
                              +{country.languages.length - 3} more
                            </Text>
                          )}
                        </View>
                      </View>
                    )}

                    {/* View Details Link */}
                    <View style={styles.viewDetails}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.primary[600]} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.base,
    color: colors.text,
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
  emptyCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray[300],
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
    marginTop: spacing.xs,
  },
  countryCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  countryHeaderBar: {
    height: 4,
    backgroundColor: colors.primary[500],
  },
  countryContent: {
    padding: spacing.md,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  countryFlag: {
    fontSize: 50,
    marginRight: spacing.md,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  countryContinent: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
  },
  languagesSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  languagesTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  countryLanguages: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  languageTag: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary[700],
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  moreLanguages: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  viewDetailsText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary[600],
  },
});

export default CountriesScreen;
