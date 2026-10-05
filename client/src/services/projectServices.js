import api from "./api";

export const getProjects = async (page = 1, limit = 6) => {
  const response = await api.get("projects", {
    params: {
      page,
      limit,
    },
  });

  return response.data;
};

export const getProjectStatistics = async () => {
  const response = await api.get("projects/statistics");

  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post("projects", projectData);

  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`projects/${projectId}`);

  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(`projects/${projectId}`, projectData);

  return response.data;
};

export const addProjectMember = async (projectId, email) => {
  const response = await api.post(`projects/${projectId}/members`, {
    email,
  });

  return response.data;
};

export const removeProjectMember = async (projectId, memberId) => {
  const response = await api.delete(
    `projects/${projectId}/members/${memberId}`,
  );

  return response.data;
};
