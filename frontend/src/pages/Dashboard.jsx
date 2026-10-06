import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function Dashboard({ user }) {
  const [stalls, setStalls] = useState([]);
  const [events, setEvents] = useState([]);
  const [themes, setThemes] = useState([]);

  // New stall form
  const [newStall, setNewStall] = useState({ name: '', description: '', theme_id: '' });
  
  // New event form
  const [newEvent, setNewEvent] = useState({ name: '', time: '', venue: '', capacity: '' });

  // Edit event form
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventData, setEditEventData] = useState({ name: '', time: '', venue: '', capacity: '' });

  const loadData = async () => {
    try {
      const [eventsData, themesData] = await Promise.all([
        api.getEvents(),
        api.getThemes()
      ]);
      setEvents(eventsData);
      setThemes(themesData);

      if (user.role === 'admin') {
        setStalls(await api.getAllStalls());
      } else {
        const [approved, mine] = await Promise.all([
          api.getStalls(),
          api.getMyStalls()
        ]);
        // Combine but mark mine
        const myIds = new Set(mine.map(s => s.id));
        const combined = [...mine, ...approved.filter(s => !myIds.has(s.id))];
        setStalls(combined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleProposeStall = async (e) => {
    e.preventDefault();
    await api.createStall(newStall);
    setNewStall({ name: '', description: '', theme_id: '' });
    loadData();
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newEvent)
    });
    setNewEvent({ name: '', time: '', venue: '', capacity: '' });
    loadData();
  };

  const handleEditEventClick = (evt) => {
    setEditingEvent(evt.id);
    setEditEventData({ name: evt.name, time: evt.time, venue: evt.venue, capacity: evt.capacity });
  };

  const handleSaveEditEvent = async (id) => {
    await api.editEvent(id, editEventData);
    setEditingEvent(null);
    loadData();
  };

  const handleApprove = async (id) => {
    await api.approveStall(id);
    loadData();
  };

  const handleReject = async (id) => {
    await api.rejectStall(id);
    loadData();
  };

  const handleJoinEvent = async (id) => {
    try {
      await api.joinEvent(id);
      loadData();
    } catch (e) { alert('Could not join event: ' + e.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Welcome to FestManager!</h2>
      </div>

      <div className="grid grid-cols-2">
        {/* STALLS SECTION */}
        <div>
          <h3>Fest Stalls</h3>
          <div className="grid grid-cols-1">
            {stalls.map(s => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4>{s.name}</h4>
                  <span className={`badge ${s.status === 'approved' ? 'success' : s.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {s.status}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Theme: {s.theme_name}</p>
                <p style={{ marginTop: '0.5rem' }}>{s.description}</p>
                
                {user.role === 'admin' && s.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => handleApprove(s.id)} className="btn btn-success">Approve</button>
                    <button onClick={() => handleReject(s.id)} className="btn btn-danger">Reject</button>
                  </div>
                )}
              </div>
            ))}
            {stalls.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No stalls found.</p>}
          </div>

          {user.role === 'student' && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <h4>Propose a Stall</h4>
              <form onSubmit={handleProposeStall} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <input type="text" placeholder="Stall Name" className="form-input" required
                    value={newStall.name} onChange={e => setNewStall({...newStall, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <select className="form-select" required
                    value={newStall.theme_id} onChange={e => setNewStall({...newStall, theme_id: e.target.value})}>
                    <option value="">Select Theme</option>
                    {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <textarea placeholder="Description" className="form-textarea" required rows="3"
                    value={newStall.description} onChange={e => setNewStall({...newStall, description: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Submit Proposal</button>
              </form>
            </div>
          )}
        </div>

        {/* EVENTS SECTION */}
        <div>
          <h3>Schedule & Events</h3>
          <div className="grid grid-cols-1">
            {events.map(e => (
              <div key={e.id} className="card">
                {editingEvent === e.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" className="form-input" value={editEventData.name} onChange={ev => setEditEventData({...editEventData, name: ev.target.value})} />
                    <input type="time" className="form-input" value={editEventData.time} onChange={ev => setEditEventData({...editEventData, time: ev.target.value})} />
                    <input type="number" className="form-input" value={editEventData.capacity} onChange={ev => setEditEventData({...editEventData, capacity: ev.target.value})} />
                    <input type="text" className="form-input" value={editEventData.venue} onChange={ev => setEditEventData({...editEventData, venue: ev.target.value})} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button className="btn btn-success" onClick={() => handleSaveEditEvent(e.id)}>Save</button>
                      <button className="btn btn-outline" onClick={() => setEditingEvent(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4>{e.name}</h4>
                      {user.role === 'admin' && (
                        <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditEventClick(e)}>Edit</button>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      <p>🕒 {e.time}</p>
                      <p>📍 {e.venue}</p>
                      <p>👥 {e.joined_count} / {e.capacity} joined</p>
                    </div>
                    {user.role === 'student' && e.joined_count < e.capacity && (
                       <button onClick={() => handleJoinEvent(e.id)} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                         Join Event
                       </button>
                    )}
                  </>
                )}
              </div>
            ))}
            {events.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No events scheduled.</p>}
          </div>

          {user.role === 'admin' && (
            <div className="card" style={{ marginTop: '2rem' }}>
              <h4>Create Event</h4>
              <form onSubmit={handleCreateEvent} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <input type="text" placeholder="Event Name" className="form-input" required
                    value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <input type="time" className="form-input" required
                      value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <input type="number" placeholder="Capacity" className="form-input" required
                      value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Venue" className="form-input" required
                    value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary">Add Event</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
