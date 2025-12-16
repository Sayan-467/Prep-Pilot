import api from './api';

export const getSheets = async () => {
  const response = await api.get('/sheets');
  return response.data;
};

export const getSheet = async (id) => {
  const response = await api.get(`/sheets/${id}`);
  return response.data;
};

export const createSheet = async (sheetData) => {
  const response = await api.post('/sheets', sheetData);
  return response.data;
};

export const updateSheet = async (id, sheetData) => {
  const response = await api.put(`/sheets/${id}`, sheetData);
  return response.data;
};

export const deleteSheet = async (id) => {
  const response = await api.delete(`/sheets/${id}`);
  return response.data;
};

export const exportSheetCsv = async (id) => {
  const response = await api.get(`/sheets/${id}/export`, {
    responseType: 'blob'
  });
  return response.data;
};
