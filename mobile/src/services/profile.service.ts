import api from '../config/api';

class ProfileService {
  async getMe() {
    const response = await api.get('/profiles/me');
    return response.data.data;
  }

  async getProfile(userId: string) {
    const response = await api.get(`/profiles/${userId}`);
    return response.data.data;
  }

  async updateProfile(data: any) {
    const response = await api.put('/profiles/me', data);
    return response.data.data;
  }
}

export default new ProfileService();

