import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const authData = response.data.data;

    // Token'ları ve user'ı kaydet
    await AsyncStorage.setItem('accessToken', authData.tokens.accessToken);
    await AsyncStorage.setItem('refreshToken', authData.tokens.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(authData.user));

    return authData;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;

    // Token'ları ve user'ı kaydet
    await AsyncStorage.setItem('accessToken', authData.tokens.accessToken);
    await AsyncStorage.setItem('refreshToken', authData.tokens.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(authData.user));

    return authData;
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  async getStoredUser(): Promise<any> {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }
}

export default new AuthService();

