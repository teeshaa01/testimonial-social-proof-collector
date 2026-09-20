import axiosClient from './axiosClient';

export const spaceApi = {
  getAll: () => axiosClient.get('/spaces'),
  getById: (id) => axiosClient.get(`/spaces/${id}`),
  create: (formData) =>
    axiosClient.post('/spaces', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id, formData) =>
    axiosClient.put(`/spaces/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id) => axiosClient.delete(`/spaces/${id}`),
  getMetrics: (id) => axiosClient.get(`/spaces/${id}/metrics`)
};
