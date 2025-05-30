import axios from 'axios';

const API_URL = '/api/auth/'; // Adjust if your Django backend is served on a different port/domain during development

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Token ${token}` };
  }
  return {};
};

const registerUser = (userData) => {
  return axios.post(`${API_URL}register/`, userData);
};

const loginUser = (credentials) => {
  return axios.post(`${API_URL}login/`, credentials);
};

const logoutUser = () => {
  return axios.post(`${API_URL}logout/`, {}, { headers: getAuthHeaders() });
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getAuthHeaders // Exporting this to be used for other authenticated API calls if needed
};
