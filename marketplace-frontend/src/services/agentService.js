import axios from 'axios';
import authService from './authService'; // To get headers or token easily

const API_URL = '/api/agents/'; // Adjust if your Django backend is served on a different port/domain

const uploadAgent = (formData) => {
  const headers = authService.getAuthHeaders();
  // When sending FormData, browsers usually set the Content-Type header automatically,
  // including the boundary. Explicitly setting it can sometimes cause issues
  // if not perfectly matching what the browser would send.
  // However, if the backend strictly requires it, you might need to add:
  // headers['Content-Type'] = 'multipart/form-data';

  return axios.post(`${API_URL}upload/`, formData, { headers });
};

const getAgents = (page = 1) => {
  // The backend uses PageNumberPagination, so it expects a `page` query parameter.
  return axios.get(API_URL, { params: { page } }); 
  // No specific headers needed for public GET usually, unless backend requires auth for listing.
};

const getAgentById = (agentId) => {
  return axios.get(`${API_URL}${agentId}/`);
  // No specific headers needed for public GET.
};

export default {
  uploadAgent,
  getAgents,
  getAgentById,
};
