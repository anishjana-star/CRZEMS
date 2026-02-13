import api from './api';

export const createMeeting = async (payload) => {
  return await api('/admin/meetings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const createMeetingAsUser = async (payload) => {
  return await api('/employee/meetings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const getMyMeetings = async () => {
  return await api('/employee/meetings');
};

export const getAllMeetings = async () => {
  return await api('/admin/meetings');
};
