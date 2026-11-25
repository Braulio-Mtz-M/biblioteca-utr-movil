import { apiFetch } from './apiFetch';

export const loginRequest = (credentials) =>
  apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const registerRequest = (userData) =>
  apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...userData, rol: 'USER' }),
  });

export const getBooksRequest = (search = '', categoria = '') => {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (categoria.trim()) params.append('categoria', categoria.trim());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/api/books${queryString}`);
};

export const createLoanRequest = (loanPayload) =>
  apiFetch('/api/loans/books', {
    method: 'POST',
    body: JSON.stringify(loanPayload),
  });

export const getLoansRequest = () => apiFetch('/api/loans/books');