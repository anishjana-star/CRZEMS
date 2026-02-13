import api from './api';

export const postMessage = async (groupId, content) => {
  return await api('/employee/messages', {
    method: 'POST',
    body: JSON.stringify({ groupId, content })
  });
};

export const getMessages = async (groupId) => {
  return await api(`/employee/groups/${groupId}/messages`);
};
