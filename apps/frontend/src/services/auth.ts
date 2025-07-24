import api from './api';

export async function login(email: string, password: string) {
  return api.post('/auth/login', { email, password });
}

export async function register(name: string, email: string, password: string) {
  return api.post('/auth/register', { name, email, password });
}
