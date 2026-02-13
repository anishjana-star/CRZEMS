import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  Search, 
  Inbox, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { getMyMeetings } from '../../services/meetingService';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMyMeetings();
        setMeetings(data || []);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(filter.toLowerCase())
  );

  const isLive = (date) => {
    const scheduled = new Date(date);
    const now = new Date();
    const diff = now - scheduled;
    return diff >= 0 && diff < 3600000; // Live if started in the last hour
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Meetings</h1>
            <p className="text-slate-500 font-medium mt-1">Stay on top of your schedule and collaborations.</p>
          </div>
          
          <button 
            onClick={() => navigate('/employee/meetings/create')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            Schedule Meeting
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by title or topic..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600"
          />
        </div>

        {/* Meetings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredMeetings.length > 0 ? (
          <div className="grid gap-4">
            {filteredMeetings.map((m) => {
              const live = isLive(m.scheduledAt);
              const dateObj = new Date(m.scheduledAt);

              return (
                <div 
                  key={m._id} 
                  className={`group bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                    live ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-stretch md:items-center p-2">
                    
                    {/* Date Chip */}
                    <div className={`flex flex-col items-center justify-center p-4 md:w-32 rounded-2xl ${
                      live ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600'
                    }`}>
                      <span className="text-xs font-black uppercase tracking-widest opacity-80">
                        {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-3xl font-black">
                        {dateObj.getDate()}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6 space-y-2">
                      <div className="flex items-center gap-3">
                        {live && (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-black text-white uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live Now
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {m.title}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-indigo-400" />
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Video size={16} className="text-indigo-400" />
                          {m.url ? 'Video Call' : 'In-person'}
                        </div>
                      </div>

                      {m.description && (
                        <p className="text-slate-500 text-sm font-medium line-clamp-1 mt-1">
                          {m.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="p-6 md:border-l border-slate-50 flex items-center justify-between md:justify-end gap-4 bg-slate-50/50 md:bg-transparent">
                      <button className="text-slate-300 hover:text-slate-600 transition-colors p-2">
                        <MoreHorizontal size={20} />
                      </button>
                      
                      {m.url ? (
                        <a 
                          href={m.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                            live 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95' 
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Join <ExternalLink size={16} />
                        </a>
                      ) : (
                        <div className="px-6 py-3 text-slate-400 text-sm font-bold italic">
                          No link
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox size={48} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No meetings found</h2>
            <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
              Your schedule is clear! If you're looking for something specific, try adjusting your search.
            </p>
          </div>
        )}

        {/* Calendar Footer Tip */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            <Calendar size={16} /> All times are shown in your local timezone
          </p>
        </div>
      </div>
    </div>
  );
};

export default Meetings;