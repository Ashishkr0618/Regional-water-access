import axios from 'axios';

// Axios instance configured for Vite proxy (/api -> http://127.0.0.1:5000)
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Server connection error';
    return Promise.reject(new Error(message));
  }
);

export const getHealth = () => api.get('/api/health');

export const getDashboard = () => api.get('/api/dashboard');

export const getDataset = () => api.get('/api/dataset');

export const runClustering = (nClusters) =>
  api.post('/api/clustering', { n_clusters: nClusters });

export const getEvaluation = () => api.get('/api/evaluation');

export const getClusterProfiles = () => api.get('/api/cluster-profiles');

export const uploadDataset = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const predictWaterQuality = (params) =>
  api.post('/api/predict-water-quality', params);

export const getPredictionHistory = (limit = 10) =>
  api.get(`/api/prediction-history?limit=${limit}`);

export const getWaterQualityMetrics = () =>
  api.get('/api/water-quality-metrics');

export default api;
