import axiosClient from './axiosClient';

export const publicApi = {
  getSpace: (slug) => axiosClient.get(`/public/spaces/${slug}`),
  submitTestimonial: (slug, formData) =>
    axiosClient.post(`/public/testimonials/${slug}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getWall: (slug) => axiosClient.get(`/public/wall/${slug}`)
};
