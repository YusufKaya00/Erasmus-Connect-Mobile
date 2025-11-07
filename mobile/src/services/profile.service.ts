import api from '../config/api';

class ProfileService {
  async getMe() {
    const response = await api.get('/profile/me');
    return response.data.data;
  }

  async getProfile(userId: string) {
    const response = await api.get(`/profile/${userId}`);
    return response.data.data;
  }

  async updateProfile(data: any) {
    const response = await api.put('/profile', data);
    return response.data.data;
  }
}

export default new ProfileService();

