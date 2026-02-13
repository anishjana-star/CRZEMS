import Meeting from '../models/Meeting.js';
import { sendEmail } from '../utils/email.js';
import User from '../models/User.js';

const createMeeting = async ({ title, description, url, participants, scheduledAt }, createdBy) => {
  if (!title || !scheduledAt) throw new Error('Title and scheduledAt are required');

  const scheduled = new Date(scheduledAt);
  if (isNaN(scheduled.getTime())) throw new Error('Invalid scheduledAt date');
  if (scheduled < new Date()) throw new Error('scheduledAt must be in the future');

  // Validate participants (optional empty allowed meaning open meeting)
  const memberIds = Array.isArray(participants) ? participants : [];
  const validUsers = memberIds.length ? await User.find({ _id: { $in: memberIds } }).select('email name') : [];

  const meeting = new Meeting({ title, description: description || '', url, participants: memberIds, scheduledAt: scheduled, createdBy });
  await meeting.save();

  // Notify participants
  try {
    if (validUsers.length) {
      const emails = validUsers.map(u => u.email).join(',');
      await sendEmail({
        to: emails,
        subject: `New meeting scheduled: ${title}`,
        text: `A meeting has been scheduled at ${scheduled.toLocaleString()}.\n\nJoin link: ${url || 'No link provided'}`
      });
    }
  } catch (err) {
    console.error('Failed to send meeting emails:', err);
  }

  // Emit meeting created event for real-time notifications
  try {
    const eventBus = (await import('../eventBus.js')).default;
    eventBus.emit('meetingCreated', { meeting: meeting.toObject ? meeting.toObject() : meeting, participants: memberIds });
  } catch (err) {
    console.error('Failed to emit meetingCreated event:', err);
  }

  return meeting;
};

const getMeetingsForUser = async (userId) => {
  return await Meeting.find({ participants: userId }).populate('createdBy', 'name email').sort({ scheduledAt: -1 });
};

const getAllMeetings = async () => {
  return await Meeting.find().populate('createdBy', 'name email').sort({ scheduledAt: -1 });
};

export { createMeeting, getMeetingsForUser, getAllMeetings };
