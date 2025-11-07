import api from '../config/api';

class CountryService {
  async getAllCountries() {
    const response = await api.get('/countries');
    return response.data.data;
  }

  async getCountry(countryId: string) {
    const response = await api.get(`/countries/${countryId}`);
    return response.data.data;
  }

  async searchCountries(query: string) {
    const response = await api.get('/countries', {
      params: { search: query },
    });
    return response.data.data;
  }
}

export default new CountryService();

