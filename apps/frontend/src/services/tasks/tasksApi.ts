import api from '../api';

export async function getTasks(params?: { sort?: string }) {
  const res = await api.get('/tasks', { params });
  // Ambil array tasks dari response backend
  return res.data?.data?.tasks || [];
}

export async function getTask(id: string) {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
}

export async function createTask(data: { listId: string; title: string; description?: string; dueDate?: string }) {
  const res = await api.post('/tasks', data);
  return res.data;
}

export async function updateTask(id: string, data: { title?: string; description?: string; dueDate?: string; completed?: boolean }) {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`);
}

export async function toggleComplete(id: string) {
  const res = await api.patch(`/tasks/${id}/complete`);
  return res.data;
}

export async function getTasksDueThisWeek() {
  const res = await api.get('/tasks/due-this-week');
  return res.data;
}

export async function getTasksByList(listId: string) {
  const res = await api.get(`/lists/${listId}/tasks`);
  return res.data;
}
