import api from '../config/api';

export interface LikeData {
  likedId: string;
  category: 'ROOMMATE' | 'MENTOR' | 'COMMUNICATION';
}

class LikeService {
  async like(data: LikeData) {
    const response = await api.post('/likes', data);
    return response.data;
  }

  async unlike(data: LikeData) {
    const response = await api.delete('/likes', { data });
    return response.data;
  }

  async getLikedUsers() {
    const response = await api.get('/likes');
    return response.data.data;
  }
}

export default new LikeService();

