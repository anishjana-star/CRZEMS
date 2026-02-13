import api from './api';

export const createGroup = async (name, members) => {
  return await api('/admin/groups', {
    method: 'POST',
    body: JSON.stringify({ name, members })
  });
};

export const createGroupAsUser = async (name, members) => {
  return await api('/employee/groups', {
    method: 'POST',
    body: JSON.stringify({ name, members })
  });
};

export const getMyGroups = async () => {
  return await api('/employee/groups');
};
