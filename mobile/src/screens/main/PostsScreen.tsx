import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import postService from '../../services/post.service';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';

const PostsScreen = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getMyPosts();
      setPosts(data || []);
    } catch (error) {
      console.error('Posts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f0f9ff', '#ffffff', '#faf5ff']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Gönderilerim 📝</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          ) : posts.length === 0 ? (
            <Card>
              <View style={styles.emptyContainer}>
                <Ionicons name="newspaper-outline" size={64} color={colors.gray[400]} />
                <Text style={styles.emptyText}>Henüz gönderi yok</Text>
                <Text style={styles.emptySubtext}>İlk gönderinizi oluşturun</Text>
              </View>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={3}>
                  {post.content}
                </Text>
                <View style={styles.postFooter}>
                  <View style={styles.postStats}>
                    <Ionicons name="heart" size={16} color={colors.gray[500]} />
                    <Text style={styles.statText}>{post._count?.likes || 0}</Text>
                  </View>
                  <View style={styles.postStats}>
                    <Ionicons name="chatbubble" size={16} color={colors.gray[500]} />
                    <Text style={styles.statText}>{post._count?.comments || 0}</Text>
                  </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize['3xl'], fontWeight: 'bold', color: colors.text },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: { paddingVertical: spacing.xxl, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text, marginTop: spacing.md },
  emptySubtext: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  postCard: { marginBottom: spacing.md },
  postTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  postContent: { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.md },
  postFooter: { flexDirection: 'row', gap: spacing.md },
  postStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { fontSize: fontSize.sm, color: colors.gray[600] },
});

export default PostsScreen;

