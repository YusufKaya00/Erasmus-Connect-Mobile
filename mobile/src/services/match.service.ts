import api from '../config/api';

export type MatchCategory = 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION' | 'LIKED';

class MatchService {
  async getMatches(category: MatchCategory) {
    const response = await api.get(`/matches?category=${category}`);
    return response.data.data;
  }

  async likeProfile(likedId: string, category: MatchCategory) {
    const response = await api.post('/likes', {
      likedId,
      category,
    });
    return response.data;
  }

  async unlikeProfile(likedId: string, category: string) {
    const response = await api.delete('/likes', {
      data: { likedId, category },
    });
    return response.data;
  }

  async getLikedProfiles() {
    const response = await api.get('/likes');
    return response.data.data;
  }
}

export default new MatchService();

