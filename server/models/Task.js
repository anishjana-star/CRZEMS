import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['Web Developer', 'Application Developer', 'Tester', 'DevOps Engineer', 'UI/UX Designer', 'Data Analyst', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'QA Engineer', 'Business Analyst', 'Project Manager'],
    default: null
  }
});

export default mongoose.model('Task', taskSchema);
