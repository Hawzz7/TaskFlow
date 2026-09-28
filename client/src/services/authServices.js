import api from "./api";

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data.user;
};

export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh");

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};
