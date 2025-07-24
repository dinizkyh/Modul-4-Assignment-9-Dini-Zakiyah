import api from '../api';

export async function getLists() {
  const res = await api.get('/lists');
  // Ambil array list dari response backend
  return res.data?.data?.lists || [];
}

export async function getList(id: string) {
  const res = await api.get(`/lists/${id}`);
  return res.data;
}

export async function createList(name: string) {
  const res = await api.post('/lists', { name });
  return res.data;
}

export async function updateList(id: string, name: string) {
  const res = await api.put(`/lists/${id}`, { name });
  return res.data;
}

export async function deleteList(id: string) {
  await api.delete(`/lists/${id}`);
}
