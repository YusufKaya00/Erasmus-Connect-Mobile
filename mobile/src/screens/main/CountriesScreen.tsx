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
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f0f9ff', '#ffffff', '#faf5ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Erasmus Ülkeleri 🌍</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ülke ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          ) : filteredCountries.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <Ionicons name="earth-outline" size={64} color={colors.gray[400]} />
                <Text style={styles.emptyText}>Ülke bulunamadı</Text>
              </View>
            </Card>
          ) : (
            filteredCountries.map((country) => (
              <Card key={country.id} style={styles.countryCard}>
                <View style={styles.countryHeader}>
                  <Text style={styles.countryFlag}>{country.flag || '🌍'}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{country.name}</Text>
                    <Text style={styles.countryContinent}>{country.continent}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
                </View>
                <View style={styles.countryLanguages}>
                  {country.languages?.slice(0, 3).map((lang: string, idx: number) => (
                    <Text key={idx} style={styles.languageTag}>
                      {lang.toUpperCase()}
                    </Text>
                  ))}
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  gradient: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  title: { fontSize: fontSize['3xl'], fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.base,
    color: colors.text,
  },
  loadingContainer: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, marginTop: spacing.md },
  countryCard: { marginBottom: spacing.md },
  countryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  countryFlag: { fontSize: fontSize['3xl'], marginRight: spacing.md },
  countryInfo: { flex: 1 },
  countryName: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text },
  countryContinent: { fontSize: fontSize.sm, color: colors.textSecondary },
  countryLanguages: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  languageTag: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary[700],
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
});

export default CountriesScreen;

