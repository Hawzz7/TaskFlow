import api from "./api";

export const getCurrentUser = async () => {
  const response = await api.get("api/auth/me");

  return response.data.user;
};

export const refreshAccessToken = async () => {
  const response = await api.post("api/auth/refresh");

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("api/auth/logout");

  return response.data;
};