import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Calendar, 
  Link as LinkIcon, 
  AlignLeft, 
  Users, 
  Search, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { createMeetingAsUser } from '../../services/meetingService';
import { getAllEmployeesForUser as getAllEmployees } from '../../services/adminService';

const CreateMeetingEmployee = () => {
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
        setEmployees(data || []);
      } catch (err) {
        setMsg({ type: 'error', text: 'Could not load teammates.' });
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
      return setMsg({ type: 'error', text: 'Please provide a title and time.' });
    }
    
    try {
      setMsg({ type: '', text: '' });
      setIsSubmitting(true);
      await createMeetingAsUser({ 
        title, 
        description, 
        url, 
        scheduledAt: new Date(scheduledAt), 
        participants: Array.from(selected) 
      });
      
      setMsg({ type: 'success', text: 'Meeting scheduled! Redirecting...' });
      setTimeout(() => navigate('/employee/meetings'), 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create meeting' });
      setIsSubmitting(false);
    }
  };

  const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 ml-1">
        <Icon size={14} className="text-indigo-500" />
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Calendar
            </button>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              New Session <Sparkles className="text-amber-400" size={28} />
            </h1>
            <p className="text-slate-500 font-medium">Collaborate with your team in real-time.</p>
          </div>
        </div>

        {/* Messaging UI */}
        {msg.text && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
            msg.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={20} /> : <Users size={20} />}
            <span className="text-sm font-bold">{msg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
              
              <InputWrapper label="What's the topic?" icon={Video}>
                <input 
                  type="text"
                  placeholder="e.g. Brainstorming Session" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full text-lg p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-semibold text-slate-700"
                />
              </InputWrapper>

              <div className="grid md:grid-cols-2 gap-6">
                <InputWrapper label="When?" icon={Calendar}>
                  <input 
                    type="datetime-local" 
                    value={scheduledAt} 
                    onChange={e => setScheduledAt(e.target.value)} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-600 font-medium"
                  />
                </InputWrapper>
                
                <InputWrapper label="Join Link" icon={LinkIcon}>
                  <input 
                    placeholder="Meet / Zoom URL" 
                    value={url} 
                    onChange={e => setUrl(e.target.value)} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-600 font-medium"
                  />
                </InputWrapper>
              </div>

              <InputWrapper label="Context / Agenda" icon={AlignLeft}>
                <textarea 
                  rows={4}
                  placeholder="Share a brief agenda..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-600"
                />
              </InputWrapper>
            </div>

            <button 
              onClick={submit} 
              disabled={isSubmitting} 
              className={`w-full group flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : null}
              {isSubmitting ? 'Finalizing...' : 'Launch Meeting'}
            </button>
          </div>

          {/* Teammate Selection Area */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full min-h-[500px] overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Invite Teammates</h3>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">
                    {selected.size} ADDED
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <div 
                      key={emp._id}
                      onClick={() => toggle(emp._id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                        selected.has(emp._id) 
                        ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' 
                        : 'bg-white border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        selected.has(emp._id) ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate ${selected.has(emp._id) ? 'text-white' : 'text-slate-700'}`}>
                          {emp.name}
                        </span>
                        <span className={`text-xs truncate ${selected.has(emp._id) ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {emp.email}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selected.has(emp._id) ? 'border-white bg-white text-indigo-600' : 'border-slate-200'
                        }`}>
                          {selected.has(emp._id) && <CheckCircle2 size={14} />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">No teammates found</p>
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

export default CreateMeetingEmployee;