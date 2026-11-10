import { useEffect, useMemo, useState } from 'react';
import { api, getToken } from './api';

const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateText = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function App() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('event_user')); } catch { return null; }
  });
  const [page, setPage] = useState('events');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [eventForm, setEventForm] = useState({ title: '', description: '', category: 'General', venue: '', event_date: '', price: 0, capacity: 100, image_url: '' });

  async function loadEvents() {
    try { setEvents(await api('/events')); } catch (e) { setMessage(e.message); }
  }
  async function loadBookings() {
    if (!getToken()) return;
    try { setBookings(await api('/bookings/mine')); } catch (e) { setMessage(e.message); }
  }
  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { if (user) loadBookings(); }, [user]);

  const filtered = useMemo(() => events.filter(e =>
    `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(search.toLowerCase())
  ), [events, search]);

  async function submitAuth(e) {
    e.preventDefault(); setMessage('');
    try {
      if (authMode === 'register') {
        await api('/auth/register', { method: 'POST', body: JSON.stringify(authForm) });
        setAuthMode('login'); setMessage('Account created. Please sign in.');
      } else {
        const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(authForm) });
        localStorage.setItem('event_token', data.token);
        localStorage.setItem('event_user', JSON.stringify(data.user));
        setUser(data.user); setPage('events'); setMessage(`Welcome, ${data.user.name}!`);
      }
    } catch (e) { setMessage(e.message); }
  }
  function logout() {
    localStorage.removeItem('event_token'); localStorage.removeItem('event_user');
    setUser(null); setBookings([]); setPage('events'); setMessage('You have signed out.');
  }
  async function book(eventId) {
    if (!user) { setMessage('Please sign in to book an event.'); setPage('account'); return; }
    try {
      await api('/bookings', { method: 'POST', body: JSON.stringify({ event_id: eventId, tickets: 1 }) });
      setMessage('Your booking is confirmed!'); loadBookings();
    } catch (e) { setMessage(e.message); }
  }
  async function createEvent(e) {
    e.preventDefault();
    try {
      await api('/events', { method: 'POST', body: JSON.stringify(eventForm) });
      setMessage('Event created successfully.'); setEventForm({ title: '', description: '', category: 'General', venue: '', event_date: '', price: 0, capacity: 100, image_url: '' });
      await loadEvents();
    } catch (e) { setMessage(e.message); }
  }
  async function cancelBooking(id) {
    try { await api(`/bookings/${id}/cancel`, { method: 'PATCH' }); setMessage('Booking cancelled.'); loadBookings(); }
    catch (e) { setMessage(e.message); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={() => setPage('events')}><span className="brand-mark">E</span> eventora</a>
      <nav>
        <button className={page === 'events' ? 'nav active' : 'nav'} onClick={() => setPage('events')}>Explore events</button>
        {user && <button className={page === 'bookings' ? 'nav active' : 'nav'} onClick={() => setPage('bookings')}>My bookings</button>}
        {user && ['organizer', 'admin'].includes(user.role) && <button className={page === 'manage' ? 'nav active' : 'nav'} onClick={() => setPage('manage')}>Manage events</button>}
      </nav>
      <div className="account-actions">{user ? <><span className="welcome">Hi, {user.name.split(' ')[0]}</span><button className="btn btn-outline small" onClick={logout}>Sign out</button></> : <button className="btn btn-dark small" onClick={() => setPage('account')}>Sign in</button>}</div>
    </header>

    <main>
      {message && <div className="notice"><span>{message}</span><button onClick={() => setMessage('')}>×</button></div>}
      {page === 'events' && <>
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">MAKE EVERY MOMENT COUNT</span><h1>Find your next<br/><em>great experience.</em></h1><p>Discover inspiring events, meet new people, and make memories that last.</p>
            <div className="searchbox"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, categories or venues"/></div>
          </div>
          <div className="hero-art"><div className="art-card"><span className="art-label">YOUR NEXT CHAPTER</span><div className="art-circle">✦</div><strong>Good times<br/>start here.</strong><span className="art-date">DISCOVER • CONNECT • CELEBRATE</span></div><div className="float-tag">✧ Live experiences</div></div>
        </section>
        <section className="section-head"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Upcoming events</h2></div><span className="result-count">{filtered.length} events found</span></section>
        <section className="event-grid">
          {filtered.map((event, i) => <article className="event-card" key={event.id}>
            <div className="event-image" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(15,20,28,.22)), url("${event.image_url || ''}")` }}><span className="category">{event.category}</span><span className="event-number">0{i + 1}</span></div>
            <div className="event-info"><h3>{event.title}</h3><p className="event-desc">{event.description}</p><div className="event-meta"><span>⌖ {event.venue}</span><span>◷ {dateText(event.event_date)}</span></div><div className="event-bottom"><strong>{money(event.price)} <small>/ ticket</small></strong><button className="btn btn-dark" onClick={() => book(event.id)}>Book now ↗</button></div></div>
          </article>)}
          {!filtered.length && <div className="empty">No events match your search yet.</div>}
        </section>
      </>}
      {page === 'account' && <section className="auth-wrap"><div className="auth-panel"><span className="eyebrow">WELCOME TO EVENTORA</span><h2>{authMode === 'login' ? 'Good to see you.' : 'Create your account.'}</h2><p>Sign in to book events and keep track of your plans.</p><form onSubmit={submitAuth}>
        {authMode === 'register' && <label>Full name<input required value={authForm.name} onChange={e => setAuthForm({...authForm, name:e.target.value})} placeholder="Your name"/></label>}
        <label>Email address<input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email:e.target.value})} placeholder="name@example.com"/></label>
        <label>Password<input required minLength="8" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password:e.target.value})} placeholder="At least 8 characters"/></label>
        <button className="btn btn-dark full">{authMode === 'login' ? 'Sign in' : 'Create account'} →</button>
      </form><button className="text-btn" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'New here? Create an account' : 'Already registered? Sign in'}</button></div></section>}
      {page === 'bookings' && <section className="content-page"><span className="eyebrow">YOUR PLANS</span><h2>My bookings</h2><div className="booking-list">{bookings.map(b => <article className="booking-row" key={b.booking_id}><div><h3>{b.title}</h3><p>{b.venue} · {dateText(b.event_date)}</p><small>{b.tickets} ticket(s) · {b.status}</small></div><div className="booking-right"><strong>{money(b.price * b.tickets)}</strong>{b.status === 'confirmed' && <button className="text-btn danger" onClick={() => cancelBooking(b.booking_id)}>Cancel booking</button>}</div></article>)}{!bookings.length && <div className="empty">You have no bookings yet. Explore an event to get started.</div>}</div></section>}
      {page === 'manage' && <section className="content-page"><span className="eyebrow">ORGANIZER SPACE</span><h2>Create an event</h2><p className="muted">Add an event for people to discover and book.</p><form className="event-form" onSubmit={createEvent}>
        <label>Event title<input required value={eventForm.title} onChange={e => setEventForm({...eventForm,title:e.target.value})}/></label>
        <label>Category<input value={eventForm.category} onChange={e => setEventForm({...eventForm,category:e.target.value})}/></label>
        <label>Venue<input required value={eventForm.venue} onChange={e => setEventForm({...eventForm,venue:e.target.value})}/></label>
        <label>Date and time<input required type="datetime-local" value={eventForm.event_date} onChange={e => setEventForm({...eventForm,event_date:e.target.value})}/></label>
        <label>Ticket price (₹)<input type="number" min="0" value={eventForm.price} onChange={e => setEventForm({...eventForm,price:e.target.value})}/></label>
        <label>Capacity<input type="number" min="1" value={eventForm.capacity} onChange={e => setEventForm({...eventForm,capacity:e.target.value})}/></label>
        <label className="wide">Image URL<input value={eventForm.image_url} onChange={e => setEventForm({...eventForm,image_url:e.target.value})}/></label>
        <label className="wide">Description<textarea rows="4" value={eventForm.description} onChange={e => setEventForm({...eventForm,description:e.target.value})}/></label>
        <button className="btn btn-dark">Publish event →</button>
      </form></section>}
    </main>
    <footer><a className="brand" href="#" onClick={() => setPage('events')}><span className="brand-mark">E</span> eventora</a><span>Thoughtfully bringing people together.</span><small>© 2026 Eventora</small></footer>
  </div>;
}
