import api from '../config/api';

class PostService {
  async getAllPosts(filters?: any) {
    const response = await api.get('/posts', { params: filters });
    return response.data.data;
  }

  async getMyPosts() {
    const response = await api.get('/posts/my-posts');
    return response.data.data;
  }

  async getPost(postId: string) {
    const response = await api.get(`/posts/${postId}`);
    return response.data.data;
  }

  async createPost(data: any) {
    const response = await api.post('/posts', data);
    return response.data.data;
  }

  async deletePost(postId: string) {
    await api.delete(`/posts/${postId}`);
  }

  async likePost(postId: string) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId: string) {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  }
}

export default new PostService();

