import apiClient from './apiClient';

export const getRecommendations = async (userId) => {
  const response = await apiClient.get(`/recommendations/${userId}`);
  return response.data;
};

export const generateRecommendations = async (healthMetrics) => {
  const response = await apiClient.post('/recommendations/generate', healthMetrics);
  return response.data;
};