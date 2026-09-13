import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, CalendarDays, CheckCircle2, ChevronRight, CircleDot,
  Clock3, DoorOpen, Gauge, LayoutDashboard, LogOut, MapPin, Radio, RefreshCw,
  ScanLine, Search, Settings2, Sparkles, Users, Wifi
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const authHeaders = (token) => token ? { Authorization: `Bearer ${token}` } : {};

async function api(path, options = {}, token) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(token), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatDate = (value) => new Date(value).toLocaleDateString([], { day: '2-digit', month: 'short' });

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@campus.local', password: 'admin123' });
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try { onLogin(await api('/auth/login', { method: 'POST', body: JSON.stringify(form) })); }
    catch (e) { setError(e.message); }
  };
  return <main className="login-shell"><nav className="site-nav"><strong>RoomPulse</strong><span>Campus classroom operations</span></nav>
    <div className="login-orb orb-a" /><div className="login-orb orb-b" />
    <form onSubmit={submit} className="login-card">
      <div className="brand-mark"><Radio size={22} /></div>
      <p className="eyebrow">IEEE CAMPUS OPERATIONS</p>
      <h1>RoomPulse</h1>
      <p className="login-copy">Find an open room. Know its live capacity. Plan your next chapter event without walking floor to floor.</p>
      <label>Email<input className="field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input className="field" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
      {error && <p className="error-box">{error}</p>}
      <button className="primary-button w-full">Enter command center <ArrowUpRight size={17} /></button>
      <p className="demo-note">Demo access · admin@campus.local · admin123</p>
    </form><footer className="site-footer">RoomPulse · Smart classroom operations</footer>
  </main>;
}

function Sidebar({ active, setActive, onLogout, admin }) {
  const items = [
    ['overview', 'Overview', LayoutDashboard],
    ['rooms', 'Room scout', ScanLine],
    ['events', 'Event planner', CalendarDays],
    ['activity', 'Sensor activity', Activity]
  ];
  return <aside className="sidebar">
    <div className="sidebar-brand"><div className="brand-mark small"><Radio size={18} /></div><div><strong>RoomPulse</strong><span>IEEE chapter ops</span></div></div>
    <div className="live-chip"><span className="live-dot" /> Sensor network live</div>
    <nav>{items.map(([key, label, Icon]) => <button key={key} onClick={() => setActive(key)} className={active === key ? 'nav-item active' : 'nav-item'}><Icon size={17} />{label}{active === key && <ChevronRight size={15} className="nav-arrow" />}</button>)}</nav>
    <div className="sidebar-bottom">
      <div className="network-card"><div className="network-title"><Wifi size={15} /> Network health</div><strong>98.6%</strong><span>5 sensors reporting normally</span><div className="health-bars">{[1, 2, 3, 4, 5, 6, 7].map(i => <i key={i} />)}</div></div>
      <div className="profile"><div className="avatar">{admin?.name?.slice(0, 1) || 'A'}</div><div><strong>{admin?.name || 'Administrator'}</strong><span>Campus admin</span></div><button onClick={onLogout} title="Log out"><LogOut size={16} /></button></div>
    </div>
  </aside>;
}

function Header({ active, refreshing, onRefresh, darkMode, setDarkMode, history }) {
  const titles = { overview: ['Good evening, team', 'Here is what is happening across your campus right now.'], rooms: ['Room scout', 'Scan live availability before you walk to a classroom.'], events: ['Event planner', 'Turn a headcount into the right room in seconds.'], activity: ['Sensor activity', 'A live audit trail from your ESP32 / PIR network.'] };
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = history.slice(0, 4);
  return <header className="topbar"><div><p className="eyebrow">{active === 'overview' ? 'THURSDAY · 11 SEPTEMBER 2026' : 'IEEE STUDENT CHAPTER · LIVE CONSOLE'}</p><h2>{titles[active][0]}</h2><p className="subtle">{titles[active][1]}</p></div><div className="top-actions"><button className="theme-toggle" onClick={() => setDarkMode(value => !value)} aria-pressed={darkMode}>{darkMode ? 'Dark' : 'Light'}</button><div className="notification-wrap"><button className="icon-button" onClick={() => setShowNotifications(value => !value)} aria-label="Show notifications" aria-expanded={showNotifications}><Bell size={18} />{notifications.length > 0 && <span className="notification-dot" />}</button>{showNotifications && <div className="notification-panel"><div className="notification-heading"><strong>Notifications</strong><button onClick={() => setShowNotifications(false)}>Close</button></div>{notifications.length ? notifications.map(item => <div className="notification-item" key={item.id}><span className={item.people_count ? 'notification-state occupied' : 'notification-state free'} /> <div><strong>{item.room_name}</strong><span>{item.people_count ? `${item.people_count} people detected` : 'Room is empty'} · {formatTime(item.recorded_at)}</span></div></div>) : <p className="subtle">No recent sensor activity.</p>}</div>}</div><button className="refresh-button" onClick={onRefresh}><RefreshCw size={15} className={refreshing ? 'spin' : ''} /> Sync now</button></div></header>;
}

function StatCard({ icon: Icon, label, value, detail, color }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19} /></div><div className="stat-label">{label}</div><strong>{value}</strong><span className="stat-detail">{detail}</span></div>;
}

function HowToUse() {
  return <section className="how-to-use"><div><p className="eyebrow">HOW TO USE</p><h3>Three quick steps</h3></div><div className="instruction-list"><div><strong>1</strong><span><b>Check rooms</b> to see live capacity and availability.</span></div><div><strong>2</strong><span><b>Plan an event</b> with the expected number of attendees.</span></div><div><strong>3</strong><span><b>Choose a room</b> or let RoomPulse select the smallest suitable one.</span></div></div></section>;
}

function RoomCard({ room, onSelect, selected }) {
  const percent = Math.min(100, Math.round((room.people_count / room.capacity) * 100));
  const state = percent === 0 ? 'EMPTY' : percent >= 90 ? 'FULL' : percent >= 60 ? 'BUSY' : 'OPEN';
  return <button onClick={() => onSelect(room)} className={`room-card ${selected ? 'selected' : ''}`}>
    <div className="room-card-top"><div className="room-id"><span className={`state-dot ${state.toLowerCase()}`} />{room.name}</div><span className={`state-pill ${state.toLowerCase()}`}>{state}</span></div>
    <p className="room-building"><MapPin size={12} /> {room.building} · floor {room.floor}</p>
    <div className="room-number"><strong>{room.people_count}</strong><span>/ {room.capacity}<br />people inside</span></div>
    <div className="capacity-track"><i style={{ width: `${percent}%` }} className={state.toLowerCase()} /></div>
    <div className="room-footer"><span><Clock3 size={12} /> updated {formatTime(room.recorded_at)}</span><span>{room.equipment?.[0] || 'Classroom'} <ChevronRight size={13} /></span></div>
  </button>;
}

function LiveRooms({ rooms, selected, onSelect, refreshing }) {
  return <section className="section-block"><div className="section-heading"><div><p className="eyebrow">LIVE FLOOR PLAN</p><h3>Which room is free right now?</h3></div><span className="sync-label"><span className="live-dot" /> auto-sync · 5 sec</span></div><div className="rooms-grid">{rooms.map(room => <RoomCard key={room.id} room={room} selected={selected?.id === room.id} onSelect={onSelect} />)}</div>{refreshing && <div className="syncing"><RefreshCw size={13} className="spin" /> Reading sensors…</div>}</section>;
}

function RoomInsight({ room, onClose }) {
  if (!room) return <div className="insight empty-insight"><Sparkles size={22} /><strong>Click a room to inspect it</strong><span>See live headcount, sensor source and event-fit at a glance.</span></div>;
  const available = room.capacity - room.people_count;
  return <div className="insight"><div className="insight-head"><div><p className="eyebrow">SELECTED ROOM</p><h3>{room.name}</h3></div><button onClick={onClose}>×</button></div><div className="insight-location"><MapPin size={14} /> {room.building} · floor {room.floor}</div><div className="occupancy-ring"><div><strong>{room.people_count}</strong><span>inside now</span></div></div><div className="insight-metrics"><div><span>Available seats</span><strong>{available}</strong></div><div><span>Capacity used</span><strong>{Math.round(room.people_count / room.capacity * 100)}%</strong></div></div><div className="sensor-status"><div><span className="live-dot" /> PIR sensor online</div><span>{formatTime(room.recorded_at)}</span></div><button className="secondary-button" onClick={() => window.dispatchEvent(new CustomEvent('open-planner', { detail: room }))}>Plan event here <ArrowUpRight size={15} /></button></div>;
}

function EventPlanner({ rooms, token, onSaved, preselected }) {
  const [form, setForm] = useState({ purpose: 'IEEE Student Chapter event', bookedBy: 'IEEE Student Chapter', startTime: '', endTime: '', attendees: 30, roomId: '' });
  const [message, setMessage] = useState('');
  useEffect(() => { if (preselected) setForm(old => ({ ...old, roomId: String(preselected.id) })); }, [preselected]);
  const suitable = useMemo(() => rooms.filter(room => room.capacity >= Number(form.attendees || 0) && room.people_count === 0).sort((a, b) => a.capacity - b.capacity), [rooms, form.attendees]);
  const set = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const submit = async (e) => {
    e.preventDefault(); setMessage('');
    try {
      const payload = { ...form, roomId: form.roomId || undefined, attendees: Number(form.attendees) };
      const booking = await api('/bookings', { method: 'POST', body: JSON.stringify(payload) }, token);
      setMessage(`Reserved ${booking.room_name} · smallest suitable room selected`);
      onSaved();
    } catch (err) { setMessage(err.message); }
  };
  return <section className="planner-card"><div className="planner-glow" /><div className="planner-content"><div className="planner-heading"><div className="planner-icon"><CalendarDays size={20} /></div><div><p className="eyebrow">NO MORE FLOOR WALKS</p><h3>Plan your next event</h3><p>Tell us the headcount. RoomPulse picks the smallest free room that fits.</p></div></div><form onSubmit={submit} className="planner-form"><div className="field-group wide"><label>What are you hosting?</label><input className="field" value={form.purpose} onChange={e => set('purpose', e.target.value)} /></div><div className="field-group"><label>Expected people</label><div className="input-with-icon"><Users size={15} /><input className="field" min="1" type="number" value={form.attendees} onChange={e => set('attendees', e.target.value)} /></div></div><div className="field-group"><label>Room preference</label><select className="field" value={form.roomId} onChange={e => set('roomId', e.target.value)}><option value="">Auto-pick best room</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.name} · {r.capacity} seats</option>)}</select></div><div className="field-group"><label>Starts</label><input required className="field" type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} /></div><div className="field-group"><label>Ends</label><input required className="field" type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} /></div><div className="field-group wide"><label>Available matches now <span>· live sensor check</span></label><div className="match-list">{suitable.slice(0, 3).map(room => <button type="button" key={room.id} onClick={() => set('roomId', String(room.id))} className={String(room.id) === String(form.roomId) ? 'match selected' : 'match'}><span><span className="live-dot" /> {room.name}</span><strong>{room.capacity - room.people_count} free <ChevronRight size={13} /></strong></button>)}{!suitable.length && <small>No empty room currently fits this headcount. Try a smaller group.</small>}</div></div><div className="planner-submit"><button className="primary-button">Reserve room <ArrowUpRight size={16} /></button>{message && <span className={message.includes('Reserved') ? 'success-text' : 'error-text'}>{message}</span>}</div></form></div></section>;
}

function ActivityFeed({ history }) {
  return <section className="feed-card"><div className="section-heading"><div><p className="eyebrow">AUDIT TRAIL</p><h3>Latest sensor readings</h3></div><CircleDot size={18} className="muted-icon" /></div><div className="feed-list">{history.slice(0, 7).map(item => <div className="feed-row" key={item.id}><div className={`feed-icon ${item.people_count ? 'occupied' : 'free'}`}>{item.people_count ? <Users size={15} /> : <CheckCircle2 size={15} />}</div><div><strong>{item.room_name}</strong><span>{item.people_count ? `${item.people_count} people detected` : 'Room is empty'}</span></div><time>{formatTime(item.recorded_at)}</time></div>)}{!history.length && <p className="subtle">No readings yet.</p>}</div></section>;
}

function AppShell({ session, onLogout, darkMode, setDarkMode }) {
  const [active, setActive] = useState('overview');
  const [rooms, setRooms] = useState([]);
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [report, setReport] = useState(null);
  const [selected, setSelected] = useState(null);
  const [plannerRoom, setPlannerRoom] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const token = session.token;
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [roomData, historyData, scheduleData, reportData] = await Promise.all([
        api('/rooms'), api('/occupancy/history?limit=30'), api('/schedules', {}, token), api('/reports/utilization', {}, token)
      ]);
      setRooms(roomData); setHistory(historyData); setSchedules(scheduleData); setReport(reportData); setError('');
      setSelected(old => old ? roomData.find(room => room.id === old.id) || old : null);
    } catch (e) { setError(e.message); } finally { setRefreshing(false); }
  }, [token]);
  useEffect(() => { load(); const timer = setInterval(load, 5000); return () => clearInterval(timer); }, [load]);
  useEffect(() => { const handler = e => { setPlannerRoom(e.detail); setActive('events'); }; window.addEventListener('open-planner', handler); return () => window.removeEventListener('open-planner', handler); }, []);
  const emptyRooms = rooms.filter(room => room.people_count === 0).length;
  const people = rooms.reduce((sum, room) => sum + room.people_count, 0);
  const dashboard = <><div className="stats-grid"><StatCard icon={DoorOpen} label="Classrooms tracked" value={rooms.length} detail="across 4 buildings" color="cyan" /><StatCard icon={CheckCircle2} label="Open right now" value={emptyRooms} detail="ready for your event" color="green" /><StatCard icon={Users} label="People on campus" value={people} detail="live sensor count" color="purple" /><StatCard icon={Gauge} label="Network confidence" value="98.6%" detail="last sync just now" color="orange" /></div><HowToUse /><div className="main-grid"><div><LiveRooms rooms={rooms} selected={selected} onSelect={setSelected} refreshing={refreshing} /><div className="lower-grid"><ActivityFeed history={history} /><div className="mini-card"><div className="section-heading"><div><p className="eyebrow">TODAY'S SIGNAL</p><h3>Campus utilization</h3></div><Gauge size={18} className="muted-icon" /></div><strong className="big-number">{report ? `${Math.round(report.rooms.reduce((a, r) => a + Number(r.usage_percent), 0) / Math.max(1, report.rooms.length))}%` : '—'}</strong><p className="subtle">average room usage from bookings</p><div className="sparkline">{[35, 48, 43, 70, 58, 82, 63, 76, 67, 88, 72, 80].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></div></div></div><RoomInsight room={selected} onClose={() => setSelected(null)} /></div></>;
  const content = active === 'overview' ? dashboard : active === 'rooms' ? <div className="main-grid"><div><LiveRooms rooms={rooms} selected={selected} onSelect={setSelected} refreshing={refreshing} /><ActivityFeed history={history} /></div><RoomInsight room={selected} onClose={() => setSelected(null)} /></div> : active === 'events' ? <EventPlanner rooms={rooms} token={token} preselected={plannerRoom} onSaved={load} /> : <div className="main-grid"><ActivityFeed history={history} /><div className="history-panel"><div className="section-heading"><div><p className="eyebrow">READING ARCHIVE</p><h3>What the sensors see</h3></div><Search size={18} className="muted-icon" /></div>{history.map(item => <div className="history-row" key={item.id}><span>{formatDate(item.recorded_at)} · {formatTime(item.recorded_at)}</span><strong>{item.room_name}</strong><span>{item.people_count} people</span><span className={item.people_count ? 'text-amber' : 'text-green'}>{item.people_count ? 'occupied' : 'free'}</span></div>)}</div></div>;
  return <div className="app-shell"><Sidebar active={active} setActive={setActive} onLogout={onLogout} admin={session.admin} /><main className="workspace"><nav className="workspace-nav"><strong>RoomPulse</strong><span>Smart classroom operations</span></nav><Header active={active} refreshing={refreshing} onRefresh={load} darkMode={darkMode} setDarkMode={setDarkMode} history={history} />{error && <div className="error-box page-error">{error}</div>}{content}<footer className="site-footer">RoomPulse · Smart classroom operations · Campus admin console</footer></main></div>;
}

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('smart-session') || 'null'));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('roompulse-theme') === 'dark');
  const onLogin = value => { localStorage.setItem('smart-session', JSON.stringify(value)); setSession(value); };
  const onLogout = () => { localStorage.removeItem('smart-session'); setSession(null); };
  const toggleTheme = value => { setDarkMode(value); localStorage.setItem('roompulse-theme', value ? 'dark' : 'light'); };
  return <div className={darkMode ? 'theme-mode dark-theme' : 'theme-mode'}>{session ? <AppShell session={session} onLogout={onLogout} darkMode={darkMode} setDarkMode={toggleTheme} /> : <Login onLogin={onLogin} />}</div>;
}
