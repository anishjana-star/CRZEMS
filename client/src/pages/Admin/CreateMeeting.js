import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Link, AlignLeft, Users, Search, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { createMeeting } from '../../services/meetingService';
import { getAllEmployees } from '../../services/adminService';

const CreateMeeting = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to load employees' });
      }
    })();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const submit = async () => {
    if (!title || !scheduledAt) {
      return setMsg({ type: 'error', text: 'Title and scheduled time are required' });
    }
    
    try {
      setMsg({ type: '', text: '' });
      setIsSubmitting(true);
      await createMeeting({ 
        title, 
        description, 
        url, 
        scheduledAt: new Date(scheduledAt), 
        participants: Array.from(selected) 
      });
      
      setMsg({ type: 'success', text: 'Meeting scheduled successfully! Redirecting...' });
      setTimeout(() => navigate('/admin/meetings'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Something went wrong' });
      setIsSubmitting(false);
    }
  };

  // Sub-component for form inputs to keep the main return clean
  const FormField = ({ label, icon: Icon, children }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Schedule Meeting</h1>
            <p className="text-slate-500 mt-1">Set up a new session with your team members.</p>
          </div>
        </div>

        {/* Status Messaging */}
        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            {msg.type === 'success' && <CheckCircle2 size={18} />}
            <span className="text-sm font-medium">{msg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <FormField label="Meeting Title" icon={CheckCircle2}>
                <input 
                  placeholder="e.g. Q1 Strategy Sync" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </FormField>

              <FormField label="Meeting Link" icon={Link}>
                <input 
                  placeholder="https://meet.google.com/..." 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="Scheduled Date & Time" icon={Calendar}>
                  <input 
                    type="datetime-local" 
                    value={scheduledAt} 
                    onChange={e => setScheduledAt(e.target.value)} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </FormField>
              </div>

              <FormField label="Description" icon={AlignLeft}>
                <textarea 
                  rows={4}
                  placeholder="What is this meeting about?" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </FormField>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submit} 
                disabled={isSubmitting} 
                className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
                {isSubmitting ? 'Scheduling...' : 'Create Meeting'}
              </button>
            </div>
          </div>

          {/* Right Column: Participants */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-indigo-500" />
                    Participants
                  </h3>
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    {selected.size} selected
                  </span>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <label 
                      key={emp._id} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                        selected.has(emp._id) 
                        ? 'bg-indigo-50 border-indigo-100' 
                        : 'bg-transparent border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          checked={selected.has(emp._id)} 
                          onChange={() => toggle(emp._id)}
                          className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${selected.has(emp._id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {emp.name}
                        </span>
                        <span className="text-xs text-slate-500 truncate">{emp.email}</span>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-slate-400 text-sm">No employees found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;