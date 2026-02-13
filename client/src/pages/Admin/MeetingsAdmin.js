import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  ExternalLink, 
  Search,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { getAllMeetings } from '../../services/meetingService';

const MeetingsAdmin = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllMeetings();
        setMeetings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to determine meeting status for styling
  const getMeetingStatus = (dateString) => {
    const scheduled = new Date(dateString);
    const now = new Date();
    const diff = scheduled.getTime() - now.getTime();
    
    if (Math.abs(diff) < 3600000 && diff < 0) return 'live'; // Within last hour
    if (diff < 0) return 'past';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meetings</h1>
            <p className="text-slate-500 mt-1">Manage corporate syncs and virtual huddles.</p>
          </div>
          
          <button 
            onClick={() => navigate('/admin/meetings/create')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={20} />
            Schedule New Meeting
          </button>
        </div>

        {/* Stats & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search by meeting title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-3">
            <span className="text-slate-500 text-sm font-medium">Total:</span>
            <span className="text-indigo-600 font-bold">{meetings.length}</span>
          </div>
        </div>

        {/* Meetings Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMeetings.map((m) => {
              const status = getMeetingStatus(m.scheduledAt);
              return (
                <div 
                  key={m._id} 
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-xl ${
                        status === 'live' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        <Video size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'live' && (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" /> Live Now
                          </span>
                        )}
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {m.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                      {m.description || "No description provided for this session."}
                    </p>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Calendar size={16} className="text-indigo-500" />
                        <span className="font-medium">{new Date(m.scheduledAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 text-sm">
                        <Clock size={16} className="text-indigo-500" />
                        <span className="font-medium">{new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs">
                        <User size={14} />
                        <span>Organized by <span className="text-slate-600 font-semibold">{m.createdBy?.name || 'Admin'}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                    {m.url ? (
                      <a 
                        href={m.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:gap-3 transition-all"
                      >
                        Join Discussion <ExternalLink size={16} />
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm italic">No link provided</span>
                    )}
                    
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No meetings found</h3>
            <p className="text-slate-500 mt-1">Try a different search or create a new session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsAdmin;