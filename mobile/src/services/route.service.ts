import api from '../config/api';

export interface RouteData {
  title: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  transportType: 'BUS' | 'TRAIN' | 'PLANE' | 'CAR' | 'OTHER';
  estimatedCost?: number;
  estimatedDuration?: string;
  tips?: string;
}

class RouteService {
  async getAll() {
    const response = await api.get('/routes');
    return response.data.data;
  }

  async getById(id: string) {
    const response = await api.get(`/routes/${id}`);
    return response.data.data;
  }

  async getUserRoutes(userId: string) {
    const response = await api.get(`/routes/user/${userId}`);
    return response.data.data;
  }

  async create(data: RouteData) {
    const response = await api.post('/routes', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<RouteData>) {
    const response = await api.put(`/routes/${id}`, data);
    return response.data.data;
  }

  async delete(id: string) {
    const response = await api.delete(`/routes/${id}`);
    return response.data;
  }
}

export default new RouteService();

