import axiosClient from './axiosClient';

export const testimonialApi = {
  getBySpace: (spaceId, params) =>
    axiosClient.get(`/testimonials/space/${spaceId}`, { params }),
  updateStatus: (id, status) =>
    axiosClient.patch(`/testimonials/${id}/status`, { status }),
  toggleFeature: (id) => axiosClient.patch(`/testimonials/${id}/feature`),
  toggleLike: (id) => axiosClient.patch(`/testimonials/${id}/like`),
  delete: (id) => axiosClient.delete(`/testimonials/${id}`)
};
