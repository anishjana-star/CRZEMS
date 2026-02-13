import apiRequest from './api';

/**
 * Login user
 */
export const login = async (email, password) => {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  return await apiRequest('/auth/me');
};

export const changeMyPassword = async (oldPassword, newPassword) => {
  return await apiRequest('/auth/me/password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword })
  });
};

export const updateMyEmail = async (newEmail, password) => {
  return await apiRequest('/auth/me/email', {
    method: 'PUT',
    body: JSON.stringify({ newEmail, password })
  });
};
