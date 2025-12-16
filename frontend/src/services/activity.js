import api from './api';

export const getActivities = async (limit = 100, completedOnly = false) => {
  const params = { limit };
  if (completedOnly) {
    params.completed = 'true';
  }
  const response = await api.get('/activity', { params });
  return response.data;
};

export const createActivity = async (activityData) => {
  const response = await api.post('/activity', activityData);
  return response.data;
};
