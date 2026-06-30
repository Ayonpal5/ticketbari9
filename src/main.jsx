import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createAuthClient } from 'better-auth/react';
import {
  BadgeCheck, Bus, CalendarClock, Check, ChevronDown, CreditCard, LayoutDashboard,
  LogOut, Menu, Moon, Plane, Search, Ship, ShieldCheck, Sun, Train, UserRound, X
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) : null;
const authClient = createAuthClient({ baseURL: `${API}/api/better-auth` });
const money = n => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(Number(n) || 0);
const days = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 16);
const when = value => new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const countdown = value => { const d = new Date(value).getTime() - Date.now(); return d <= 0 ? 'Departed' : `${Math.floor(d / 86400000)}d ${Math.floor(d % 86400000 / 3600000)}h ${Math.floor(d % 3600000 / 60000)}m`; };
const initials = name => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
const docId = item => item?._id || item?.id;

const photos = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?auto=format&fit=crop&w=900&q=80'
];
const seed = {
  users: [
    { _id: 'admin-1', name: 'Afsana Rahman', email: 'admin@ticketbari.com', password: 'Admin@123', role: 'admin', avatar: 'AR', fraud: false },
    { _id: 'vendor-1', name: 'Nabil Transport', email: 'vendor@ticketbari.com', password: 'Vendor@123', role: 'vendor', avatar: 'NT', fraud: false },
    { _id: 'user-1', name: 'Sami Hasan', email: 'user@ticketbari.com', password: 'User@123', role: 'user', avatar: 'SH', fraud: false }
  ],
  tickets: [
    ['GreenLine Dhaka to Coxs Bazar', 'Dhaka', 'Coxs Bazar', 'Bus', 1450, 36, 9, ['AC', 'WiFi', 'Recliner'], 0, true],
    ['Subarna Express Business Seat', 'Dhaka', 'Chattogram', 'Train', 950, 42, 5, ['Window seat', 'Snack'], 1, true],
    ['SkyLink Saver Flight', 'Dhaka', 'Sylhet', 'Plane', 4200, 18, 7, ['Cabin bag', 'Priority'], 2, true],
    ['Padma Night Launch Cabin', 'Dhaka', 'Barishal', 'Launch', 1800, 24, 11, ['Cabin', 'Dinner'], 3, true],
    ['North Bengal Comfort Coach', 'Dhaka', 'Rangpur', 'Bus', 1250, 31, 13, ['AC', 'Blanket'], 4, true],
    ['Metro Rail Tourist Pass', 'Uttara', 'Motijheel', 'Train', 220, 80, 3, ['Fast boarding'], 5, true],
    ['Coastal Air Express', 'Chattogram', 'Coxs Bazar', 'Plane', 3600, 14, 16, ['Cabin bag', 'Lounge'], 2, false],
    ['Royal Launch Premium Deck', 'Dhaka', 'Bhola', 'Launch', 1350, 40, 19, ['Upper deck', 'Breakfast'], 3, false],
    ['SilkCity Train Chair', 'Rajshahi', 'Dhaka', 'Train', 780, 50, 21, ['Tea', 'Window seat'], 1, false],
    ['Express AC Coach', 'Sylhet', 'Dhaka', 'Bus', 1150, 27, 23, ['AC', 'USB charging'], 0, false]
  ].map((t, i) => ({ _id: `ticket-${i + 1}`, title: t[0], from: t[1], to: t[2], type: t[3], price: t[4], quantity: t[5], departure: days(t[6]), perks: t[7], image: photos[t[8]], advertised: t[9], status: i === 9 ? 'pending' : 'approved', vendor: 'vendor-1', vendorName: 'Nabil Transport', vendorEmail: 'vendor@ticketbari.com', createdAt: new Date(Date.now() - i * 100000).toISOString() })),
  bookings: [
    { _id: 'booking-1', user: 'user-1', userName: 'Sami Hasan', userEmail: 'user@ticketbari.com', ticket: 'ticket-1', vendor: 'vendor-1', quantity: 2, totalPrice: 2900, status: 'accepted' },
    { _id: 'booking-2', user: 'user-1', userName: 'Sami Hasan', userEmail: 'user@ticketbari.com', ticket: 'ticket-2', vendor: 'vendor-1', quantity: 1, totalPrice: 950, status: 'pending' }
  ],
  transactions: []
};

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ticketbari-user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('ticketbari-token') || '');
  const [data, setData] = useState(seed);
  const [apiOnline, setApiOnline] = useState(false);
  const [route, setRoute] = useState(location.hash.slice(1) || '/');
  const [dark, setDark] = useState(localStorage.getItem('ticketbari-theme') === 'dark');
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const flash = text => { setToast(text); clearTimeout(window.ticketToast); window.ticketToast = setTimeout(() => setToast(''), 2600); };
  const go = path => { location.hash = path; setMenu(false); };
  const authHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};
  const api = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || 'Request failed');
    return body;
  };

  useEffect(() => { const onHash = () => setRoute(location.hash.slice(1) || '/'); addEventListener('hashchange', onHash); return () => removeEventListener('hashchange', onHash); }, []);
  useEffect(() => localStorage.setItem('ticketbari-theme', dark ? 'dark' : 'light'), [dark]);
  useEffect(() => { if (user) localStorage.setItem('ticketbari-user', JSON.stringify(user)); else localStorage.removeItem('ticketbari-user'); }, [user]);
  useEffect(() => { if (token) localStorage.setItem('ticketbari-token', token); else localStorage.removeItem('ticketbari-token'); }, [token]);
  useEffect(() => { refreshPublic(); }, []);
  useEffect(() => { if (token) refreshPrivate(user?.role); }, [token, user?.role]);

  async function refreshPublic(params = '') {
    try {
      setLoading(true);
      const [{ tickets }, latest] = await Promise.all([api(`/api/tickets?limit=100${params}`), api('/api/tickets/latest')]);
      setData(prev => ({ ...prev, tickets: tickets.length ? tickets : latest.tickets }));
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPrivate(role = user?.role) {
    if (!token) return;
    try {
      setLoading(true);
      const next = { ...data };
      if (role === 'user') {
        const [bookings, transactions] = await Promise.all([api('/api/bookings/mine'), api('/api/bookings/transactions/mine')]);
        next.bookings = bookings.bookings;
        next.transactions = transactions.transactions;
      }
      if (role === 'vendor') {
        const [mine, bookings] = await Promise.all([api('/api/tickets/vendor/mine'), api('/api/bookings/vendor')]);
        next.tickets = mergeTickets(data.tickets, mine.tickets);
        next.bookings = bookings.bookings;
      }
      if (role === 'admin') {
        const [tickets, users] = await Promise.all([api('/api/admin/tickets'), api('/api/admin/users')]);
        next.tickets = tickets.tickets;
        next.users = users.users;
      }
      setData(next);
      setApiOnline(true);
    } catch (error) {
      flash(error.message);
    } finally {
      setLoading(false);
    }
  }

  const login = async form => {
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
      setUser(result.user); setToken(result.token); go('/'); flash('Signed in with backend JWT');
    } catch {
      const found = seed.users.find(u => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password);
      if (!found) return flash('Invalid email or password');
      setUser(found); setToken('local-demo-token'); go('/'); flash('Signed in with local fallback');
    }
  };
  const register = async form => {
    try {
      const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) });
      setUser(result.user); setToken(result.token); go('/'); flash('Registered through backend');
    } catch (error) {
      const next = { _id: `local-${Date.now()}`, name: form.name, email: form.email, role: 'user', avatar: initials(form.name), fraud: false };
      setUser(next); setToken('local-demo-token'); flash(error.message || 'Registered locally'); go('/');
    }
  };
  const googleLogin = async () => {
    try {
      await authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin });
    } catch {
      window.location.href = `${API}/api/better-auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(window.location.origin)}`;
    }
  };
  const logout = () => { setUser(null); setToken(''); go('/'); };
  const approved = data.tickets.filter(t => t.status === 'approved' && !data.users?.find(u => docId(u) === (docId(t.vendor) || t.vendor))?.fraud);

  const book = async (ticket, quantity) => {
    if (!user) return go('/login');
    try {
      const result = await api('/api/bookings', { method: 'POST', body: JSON.stringify({ ticketId: docId(ticket), quantity }) });
      setData(prev => ({ ...prev, bookings: [result.booking, ...prev.bookings] }));
      setModal(null); flash('Booking saved to MongoDB');
    } catch (error) {
      const booking = { _id: `booking-${Date.now()}`, user: docId(user), userName: user.name, userEmail: user.email, ticket: docId(ticket), vendor: docId(ticket.vendor) || ticket.vendor, quantity, totalPrice: ticket.price * quantity, status: 'pending' };
      setData(prev => ({ ...prev, bookings: [booking, ...prev.bookings] }));
      setModal(null); flash(error.message || 'Booking saved locally');
    }
  };
  const pay = booking => setModal({ type: 'pay', booking });
  const completePayment = async (booking, transactionId) => {
    try {
      const result = await api(`/api/bookings/${docId(booking)}/pay`, { method: 'POST', body: JSON.stringify({ transactionId }) });
      setData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => docId(b) === docId(booking) ? result.booking : b),
        transactions: [result.transaction, ...prev.transactions],
      }));
      setModal(null); flash('Payment completed');
    } catch (error) {
      localPay(booking); setModal(null); flash(error.message || 'Demo payment completed');
    }
  };
  const localPay = booking => {
    const ticket = ticketOf(booking, data.tickets);
    setData(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => docId(b) === docId(booking) ? { ...b, status: 'paid' } : b),
      tickets: prev.tickets.map(t => docId(t) === docId(ticket) ? { ...t, quantity: t.quantity - booking.quantity } : t),
      transactions: [{ _id: `txn-${Date.now()}`, transactionId: `stripe_demo_${Date.now()}`, user: docId(user), amount: (ticket?.price || 0) * booking.quantity, ticketTitle: ticket?.title || 'Ticket', createdAt: new Date().toISOString() }, ...prev.transactions],
    }));
  };
  const addTicket = async form => {
    try {
      const result = await api('/api/tickets', { method: 'POST', body: JSON.stringify(form) });
      setData(prev => ({ ...prev, tickets: [result.ticket, ...prev.tickets] })); flash('Ticket submitted to backend');
    } catch (error) {
      const local = { ...form, _id: `ticket-${Date.now()}`, vendor: docId(user), vendorName: user.name, vendorEmail: user.email, status: 'pending', advertised: false, createdAt: new Date().toISOString() };
      setData(prev => ({ ...prev, tickets: [local, ...prev.tickets] })); flash(error.message || 'Ticket saved locally');
    }
  };
  const updateTicket = async (ticket, patch, admin = false) => {
    try {
      if (!admin && patch.status === 'deleted') {
        await api(`/api/tickets/${docId(ticket)}`, { method: 'DELETE' });
        setData(prev => ({ ...prev, tickets: prev.tickets.filter(t => docId(t) !== docId(ticket)) }));
        return;
      }
      const endpoint = admin && patch.status ? `/api/admin/tickets/${docId(ticket)}/status` : admin && 'advertised' in patch ? `/api/admin/tickets/${docId(ticket)}/advertise` : `/api/tickets/${docId(ticket)}`;
      const result = await api(endpoint, { method: 'PATCH', body: JSON.stringify(patch.status ? { status: patch.status } : patch) });
      setData(prev => ({ ...prev, tickets: prev.tickets.map(t => docId(t) === docId(ticket) ? result.ticket : t) }));
    } catch (error) {
      setData(prev => ({ ...prev, tickets: prev.tickets.map(t => docId(t) === docId(ticket) ? { ...t, ...patch } : t) })); flash(error.message);
    }
  };
  const updateBooking = async (booking, status) => {
    try {
      const result = await api(`/api/bookings/${docId(booking)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setData(prev => ({ ...prev, bookings: prev.bookings.map(b => docId(b) === docId(booking) ? result.booking : b) }));
    } catch {
      setData(prev => ({ ...prev, bookings: prev.bookings.map(b => docId(b) === docId(booking) ? { ...b, status } : b) }));
    }
  };
  const setRole = async (target, role) => {
    try {
      const result = await api(`/api/admin/users/${docId(target)}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      setData(prev => ({ ...prev, users: prev.users.map(u => docId(u) === docId(target) ? result.user : u) }));
    } catch { setData(prev => ({ ...prev, users: prev.users.map(u => docId(u) === docId(target) ? { ...u, role } : u) })); }
  };
  const fraud = async target => {
    try {
      const result = await api(`/api/admin/users/${docId(target)}/fraud`, { method: 'PATCH' });
      setData(prev => ({ ...prev, users: prev.users.map(u => docId(u) === docId(target) ? result.user : u) }));
    } catch { setData(prev => ({ ...prev, users: prev.users.map(u => docId(u) === docId(target) ? { ...u, fraud: true } : u) })); }
  };

  return <div className={dark ? 'app dark' : 'app'}>
    <Navbar user={user} go={go} logout={logout} dark={dark} setDark={setDark} menu={menu} setMenu={setMenu} apiOnline={apiOnline} />
    <main>
      {route === '/' && <Home tickets={approved} go={go} />}
      {route === '/tickets' && <AllTickets tickets={approved} go={go} />}
      {route === '/login' && <Auth mode="login" login={login} register={register} googleLogin={googleLogin} go={go} />}
      {route === '/register' && <Auth mode="register" login={login} register={register} googleLogin={googleLogin} go={go} />}
      {route.startsWith('/tickets/') && <Guard user={user} go={go}><Details ticket={approved.find(t => docId(t) === route.split('/').pop())} open={setModal} /></Guard>}
      {route.startsWith('/dashboard') && <Guard user={user} go={go}><Dashboard role={route.split('/')[2] || user?.role} user={user} data={data} updateTicket={updateTicket} updateBooking={updateBooking} addTicket={addTicket} pay={pay} setRole={setRole} fraud={fraud} api={api} /></Guard>}
      {!['/', '/tickets', '/login', '/register'].includes(route) && !route.startsWith('/tickets/') && !route.startsWith('/dashboard') && <ErrorPage go={go} />}
    </main>
    <Footer go={go} />
    {modal?.type === 'book' && <BookingModal ticket={modal.ticket} close={() => setModal(null)} submit={book} />}
    {modal?.type === 'pay' && <PaymentModal booking={modal.booking} ticket={ticketOf(modal.booking, data.tickets)} api={api} close={() => setModal(null)} complete={completePayment} />}
    {loading && <LoadingOverlay />}
    {toast && <div className="toast"><Check size={16} />{toast}</div>}
  </div>;
}

function mergeTickets(existing, incoming) { const map = new Map(existing.map(t => [docId(t), t])); incoming.forEach(t => map.set(docId(t), t)); return [...map.values()]; }
function ticketOf(booking, tickets) { const ticket = booking.ticket && typeof booking.ticket === 'object' ? booking.ticket : tickets.find(t => docId(t) === (docId(booking.ticket) || booking.ticket)); return ticket; }
function Transport({ type }) { const Icon = type === 'Train' ? Train : type === 'Plane' ? Plane : type === 'Launch' ? Ship : Bus; return <Icon size={17} />; }
function Navbar({ user, go, logout, dark, setDark, menu, setMenu, apiOnline }) {
  return <header className="topbar"><button className="icon mobile" onClick={() => setMenu(true)}><Menu size={20} /></button><button className="brand" onClick={() => go('/')}><span><Bus size={20} /></span>TicketBari</button><nav className={menu ? 'nav open' : 'nav'}><button className="icon close" onClick={() => setMenu(false)}><X size={18} /></button><button onClick={() => go('/')}>Home</button><button onClick={() => go('/tickets')}>All Tickets</button><button onClick={() => go(user ? `/dashboard/${user.role}` : '/dashboard')}>Dashboard</button></nav><div className="actions"><small title={apiOnline ? 'Connected to backend' : 'Local fallback'}>{apiOnline ? 'API' : 'LOCAL'}</small><button className="icon" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>{!user ? <><button className="ghost" onClick={() => go('/login')}>Login</button><button className="primary" onClick={() => go('/register')}>Register</button></> : <div className="account"><span className="avatar">{user.avatar || initials(user.name)}</span><b>{user.name}</b><ChevronDown size={14} /><div><button onClick={() => go(`/dashboard/${user.role}`)}><UserRound size={15} /> My Profile</button><button onClick={logout}><LogOut size={15} /> Logout</button></div></div>}</div></header>;
}
function Home({ tickets, go }) { return <><HeroSlider go={go} /><Section title="Advertised tickets" subtitle="Exactly six admin-picked offers appear here."><TicketGrid tickets={tickets.filter(t => t.advertised).slice(0, 6)} go={go} /></Section><Section title="Latest tickets" subtitle="Recently added and admin-approved journeys."><TicketGrid tickets={[...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8)} go={go} /></Section><section className="split"><div><p className="eyebrow">Popular routes</p><h2>Dhaka to Coxs Bazar, Dhaka to Chattogram, Sylhet to Dhaka.</h2><p>Search by origin and destination, filter by transport type, then compare prices without losing the rhythm of the page.</p></div><div className="route-list">{['Dhaka to Coxs Bazar', 'Dhaka to Chattogram', 'Sylhet to Dhaka', 'Rajshahi to Dhaka'].map(x => <button key={x} onClick={() => go('/tickets')}>{x}</button>)}</div></section><section className="split alt"><div><p className="eyebrow">Why choose us</p><h2>Verified trips, booking approvals, Stripe payment and countdown reminders.</h2><p>Every public ticket is admin-approved, every dashboard is role-aware, and each booking stays traceable from request to transaction history.</p></div><div className="why">{['Verified vendors', 'Payment-ready booking', 'Countdown reminders', 'Responsive dashboard'].map(x => <span key={x}><BadgeCheck size={17} />{x}</span>)}</div></section></>; }
function HeroSlider({ go }) {
  const slides = [
    'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1800&q=82',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=82'
  ];
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive(i => (i + 1) % slides.length), 4500); return () => clearInterval(id); }, []);
  return <section className="hero" style={{ '--hero-image': `url("${slides[active]}")` }}><div><p className="eyebrow">Travel without queue stress</p><h1>Book verified bus, train, launch and flight tickets in one calm place.</h1><p>TicketBari brings approved vendors, clear pricing, booking requests, payments and role dashboards into one responsive MERN platform.</p><div><button className="primary" onClick={() => go('/tickets')}>Find tickets</button><button className="ghost light" onClick={() => go('/login')}>Try demo roles</button></div><div className="hero-dots">{slides.map((_, i) => <button key={i} className={active === i ? 'active' : ''} aria-label={`Show banner ${i + 1}`} onClick={() => setActive(i)} />)}</div></div></section>;
}
function Section({ title, subtitle, children }) { return <section className="section"><div className="section-head"><h2>{title}</h2><p>{subtitle}</p></div>{children}</section>; }
function TicketGrid({ tickets, go }) { return <div className="ticket-grid">{tickets.map(t => <TicketCard key={docId(t)} ticket={t} go={go} />)}</div>; }
function TicketCard({ ticket, go }) { return <article className="ticket-card"><img src={ticket.image} alt={ticket.title} /><div><div className="title-row"><h3>{ticket.title}</h3><span><Transport type={ticket.type} />{ticket.type}</span></div><p>{ticket.from} to {ticket.to}</p><div className="meta"><b>{money(ticket.price)}</b><span>{ticket.quantity} seats</span></div><div className="perks">{ticket.perks?.map(p => <small key={p}>{p}</small>)}</div><p className="when">{when(ticket.departure)}</p><button className="primary wide" onClick={() => go(`/tickets/${docId(ticket)}`)}>See details</button></div></article>; }
function AllTickets({ tickets, go }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const list = tickets.filter(t => {
      const okType = type === 'All' || t.type === type;
      const okFrom = !from || String(t.from).toLowerCase().includes(from.toLowerCase());
      const okTo = !to || String(t.to).toLowerCase().includes(to.toLowerCase());
      return okType && okFrom && okTo;
    });
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    if (sort === 'recent') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [tickets, from, to, type, sort]);

  useEffect(() => setPage(1), [from, to, type, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const visible = filtered.slice((page - 1) * 6, page * 6);

  return <section className="section page"><div className="page-title"><h1>All Tickets</h1><p>Search by From/To, filter transport, sort by price and browse with pagination.</p></div><div className="filters"><label><Search size={18} /><input value={from} onChange={e => setFrom(e.target.value)} placeholder="From (e.g. Dhaka)" /></label><label><Search size={18} /><input value={to} onChange={e => setTo(e.target.value)} placeholder="To (e.g. Coxs Bazar)" /></label><select value={type} onChange={e => setType(e.target.value)}><option>All</option><option>Bus</option><option>Train</option><option>Launch</option><option>Plane</option></select><select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Newest first</option><option value="low">Price low to high</option><option value="high">Price high to low</option></select></div><TicketGrid tickets={visible} go={go} /><div className="pagination">{Array.from({ length: pages }, (_, i) => <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}</div></section>;
}
function Details({ ticket, open }) { if (!ticket) return <ErrorPage />; const disabled = new Date(ticket.departure) <= new Date() || ticket.quantity <= 0; return <section className="details"><img src={ticket.image} alt={ticket.title} /><div><p className="eyebrow">{ticket.type} ticket</p><h1>{ticket.title}</h1><p className="route">{ticket.from} to {ticket.to}</p><div className="detail-stats"><span>{money(ticket.price)}</span><span>{ticket.quantity} seats</span><span><CalendarClock size={16} />{when(ticket.departure)}</span><span>{countdown(ticket.departure)}</span></div><div className="perks big">{ticket.perks?.map(p => <small key={p}>{p}</small>)}</div><p>Vendor: {ticket.vendorName} ({ticket.vendorEmail})</p><button className="primary big" disabled={disabled} onClick={() => open({ type: 'book', ticket })}>{disabled ? 'Booking unavailable' : 'Book Now'}</button></div></section>; }
function BookingModal({ ticket, close, submit }) { const [qty, setQty] = useState(1); return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><div className="modal"><button className="icon modal-close" onClick={close}><X size={18} /></button><h2>Book {ticket.title}</h2><p>{ticket.quantity} seats available. Total: <b>{money(ticket.price * qty)}</b></p><label>Ticket quantity<input type="number" min="1" max={ticket.quantity} value={qty} onChange={e => setQty(Number(e.target.value))} /></label><button className="primary wide" disabled={qty < 1 || qty > ticket.quantity} onClick={() => submit(ticket, qty)}>Submit booking request</button></div></div>; }
function Auth({ mode, login, register, googleLogin, go }) { const submit = e => { e.preventDefault(); const form = Object.fromEntries(new FormData(e.currentTarget)); mode === 'login' ? login(form) : register(form); }; return <section className="auth"><form onSubmit={submit}><p className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create account'}</p><h1>{mode === 'login' ? 'Login to TicketBari' : 'Register for TicketBari'}</h1>{mode === 'register' && <label>Name<input required name="name" placeholder="Your name" /></label>}<label>Email<input required name="email" type="email" placeholder="you@example.com" /></label><label>Password<input required name="password" type="password" placeholder="Password" /></label><button className="primary wide">{mode === 'login' ? 'Login' : 'Register'}</button>{mode === 'login' && <button type="button" className="google" onClick={googleLogin}>Continue with Google</button>}<div className="demo"><b>Demo credentials</b><span>Admin: admin@ticketbari.com / Admin@123</span><span>Vendor: vendor@ticketbari.com / Vendor@123</span><span>User: user@ticketbari.com / User@123</span></div><button type="button" className="link" onClick={() => go(mode === 'login' ? '/register' : '/login')}>{mode === 'login' ? 'Need an account?' : 'Already registered?'}</button></form></section>; }
function Guard({ user, go, children }) { useEffect(() => { if (!user) go('/login'); }, [user, go]); return user ? children : <div className="loader">Checking secure route...</div>; }
function Dashboard({ role, user, data, updateTicket, updateBooking, addTicket, pay, setRole, fraud, api }) {
  if (role !== user.role && user.role !== 'admin') return <ErrorPage />;
  const ticketsById = Object.fromEntries(data.tickets.map(t => [docId(t), t]));
  const vendorTickets = data.tickets.filter(t => String(docId(t.vendor) || t.vendor) === String(docId(user)) && t.status !== 'deleted');
  const vendorBookings = data.bookings.filter(b => vendorTickets.some(t => docId(t) === (docId(b.ticket) || b.ticket)));
  const sold = vendorBookings.filter(b => b.status === 'paid').reduce((s, b) => s + b.quantity, 0);
  const revenue = vendorBookings.filter(b => b.status === 'paid').reduce((s, b) => s + (ticketOf(b, data.tickets)?.price || 0) * b.quantity, 0);
  const nav = role === 'user'
    ? [['user-profile', 'User Profile'], ['my-booked-tickets', 'My Booked Tickets'], ['transaction-history', 'Transaction History']]
    : role === 'vendor'
      ? [['vendor-profile', 'Vendor Profile'], ['add-ticket', 'Add Ticket'], ['my-added-tickets', 'My Added Tickets'], ['requested-bookings', 'Requested Bookings'], ['revenue-overview', 'Revenue Overview']]
      : [['admin-profile', 'Admin Profile'], ['manage-tickets', 'Manage Tickets'], ['manage-users', 'Manage Users'], ['advertise-tickets', 'Advertise Tickets']];
  const jump = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <section className="dashboard"><aside><h2><LayoutDashboard size={18} />{role} dashboard</h2>{nav.map(([id, label]) => <button key={id} type="button" onClick={() => jump(id)}>{label}</button>)}</aside><div className="dash-main"><Panel id={`${role}-profile`} title={`${role[0].toUpperCase()}${role.slice(1)} Profile`}><Profile user={user} /></Panel>{role === 'user' && <><Panel id="my-booked-tickets" title="My Booked Tickets"><BookingCards bookings={data.bookings.filter(b => String(docId(b.user) || b.user) === String(docId(user)))} tickets={ticketsById} pay={pay} /></Panel><Panel id="transaction-history" title="Transaction History"><Transactions items={data.transactions.filter(t => String(docId(t.user) || t.user) === String(docId(user)))} /></Panel></>}{role === 'vendor' && <><Panel id="add-ticket" title="Add Ticket"><TicketForm user={user} add={addTicket} api={api} /></Panel><Panel id="my-added-tickets" title="My Added Tickets"><VendorTickets tickets={vendorTickets} updateTicket={updateTicket} /></Panel><Panel id="requested-bookings" title="Requested Bookings"><BookingTable bookings={vendorBookings} tickets={ticketsById} updateBooking={updateBooking} /></Panel><Panel id="revenue-overview" title="Revenue Overview"><Revenue tickets={vendorTickets.length} sold={sold} revenue={revenue} /></Panel></>}{role === 'admin' && <><Panel id="manage-tickets" title="Manage Tickets"><ManageTickets tickets={data.tickets} updateTicket={updateTicket} /></Panel><Panel id="manage-users" title="Manage Users"><ManageUsers users={data.users} setRole={setRole} fraud={fraud} current={docId(user)} /></Panel><Panel id="advertise-tickets" title="Advertise Tickets"><Advertise tickets={data.tickets.filter(t => t.status === 'approved')} updateTicket={updateTicket} /></Panel></>}</div></section>;
}
function Panel({ id, title, children }) { return <section id={id} className="panel"><h2>{title}</h2>{children}</section>; }
function Profile({ user }) { return <div className="profile"><span className="avatar large">{user.avatar || initials(user.name)}</span><div><h3>{user.name}</h3><p>{user.email}</p><b>{user.role}{user.fraud ? ' - fraud marked' : ''}</b></div></div>; }
function BookingCards({ bookings, tickets, pay }) { if (!bookings.length) return <p className="empty">No bookings yet.</p>; return <div className="booking-grid">{bookings.map(b => { const t = ticketOf(b, Object.values(tickets)); if (!t) return null; const canPay = b.status === 'accepted' && new Date(t.departure) > new Date(); return <article className="booking-card" key={docId(b)}><img src={t.image} alt={t.title} /><h3>{t.title}</h3><p>{t.from} to {t.to}</p><span>Departure: {when(t.departure)}</span><span>Status: <b>{b.status}</b></span><span>Quantity: {b.quantity}</span><span>Total: {money((t.price || 0) * b.quantity)}</span>{b.status !== 'rejected' && <span>Countdown: {countdown(t.departure)}</span>}{canPay && <button className="primary wide" onClick={() => pay(b)}><CreditCard size={16} /> Pay Now</button>}</article>; })}</div>; }
function Transactions({ items }) { return items.length ? <Table heads={['Transaction ID', 'Amount', 'Ticket Title', 'Payment Date']} rows={items.map(t => [t.transactionId || docId(t), money(t.amount), t.ticketTitle, when(t.createdAt || t.date)])} /> : <p className="empty">No Stripe transactions yet.</p>; }
function TicketForm({ user, add, api }) { const [busy, setBusy] = useState(false); const upload = async file => { const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); const result = await api('/api/uploads/imgbb', { method: 'POST', body: JSON.stringify({ image: dataUrl }) }); return result.url; }; const submit = async e => { e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget); let image = f.get('imageUrl') || photos[0]; const file = f.get('imageFile'); if (file?.size) image = await upload(file).catch(() => image); add({ title: f.get('title'), from: f.get('from'), to: f.get('to'), type: f.get('type'), price: Number(f.get('price')), quantity: Number(f.get('quantity')), departure: f.get('departure'), perks: f.getAll('perks'), image }); e.currentTarget.reset(); setBusy(false); }; return <form className="form-grid" onSubmit={submit}><input name="title" required placeholder="Ticket title" /><input name="from" required placeholder="From" /><input name="to" required placeholder="To" /><select name="type"><option>Bus</option><option>Train</option><option>Launch</option><option>Plane</option></select><input name="price" required type="number" min="1" placeholder="Price" /><input name="quantity" required type="number" min="1" placeholder="Quantity" /><input name="departure" required type="datetime-local" /><input name="imageUrl" placeholder="Image URL fallback" /><input name="imageFile" type="file" accept="image/*" /><input readOnly value={user.name} /><input readOnly value={user.email} /><div className="checks">{['AC', 'Breakfast', 'WiFi', 'Cabin', 'Window seat'].map(p => <label key={p}><input name="perks" type="checkbox" value={p} />{p}</label>)}</div><button className="primary wide" disabled={busy}>{busy ? 'Uploading...' : 'Add Ticket'}</button></form>; }
function VendorTickets({ tickets, updateTicket }) { return <div className="ticket-grid compact">{tickets.map(t => <article className="ticket-card" key={docId(t)}><img src={t.image} alt={t.title} /><div><h3>{t.title}</h3><p>Status: <b>{t.status}</b></p><p>{t.quantity} seats - {money(t.price)}</p><div className="row-actions"><button disabled={t.status === 'rejected'} onClick={() => updateTicket(t, { price: t.price + 100 })}>Update</button><button disabled={t.status === 'rejected'} onClick={() => updateTicket(t, { status: 'deleted' })}>Delete</button></div></div></article>)}</div>; }
function BookingTable({ bookings, tickets, updateBooking }) { return <div className="table"><table><thead><tr><th>User</th><th>Ticket</th><th>Qty</th><th>Total</th><th>Action</th></tr></thead><tbody>{bookings.map(b => { const t = ticketOf(b, Object.values(tickets)); return <tr key={docId(b)}><td>{b.userName}<br /><small>{b.userEmail}</small></td><td>{t?.title}</td><td>{b.quantity}</td><td>{money((t?.price || 0) * b.quantity)}</td><td><button onClick={() => updateBooking(b, 'accepted')}>Accept</button><button onClick={() => updateBooking(b, 'rejected')}>Reject</button></td></tr>; })}</tbody></table></div>; }
function Revenue({ tickets, sold, revenue }) { const bars = [['Added', tickets, tickets * 12], ['Sold', sold, sold * 18], ['Revenue', money(revenue), Math.min(revenue / 150, 100)]]; return <div className="revenue"><div><span>Total tickets added</span><b>{tickets}</b></div><div><span>Total tickets sold</span><b>{sold}</b></div><div><span>Total revenue</span><b>{money(revenue)}</b></div><div className="chart">{bars.map(([label, value, h]) => <button key={label} title={`${label}: ${value}`} style={{ height: `${Math.max(h, 12)}%` }}><span>{label}</span></button>)}</div></div>; }
function ManageTickets({ tickets, updateTicket }) { return <Table heads={['Ticket', 'Vendor', 'Route', 'Status', 'Action']} rows={tickets.filter(t => t.status !== 'deleted').map(t => [t.title, t.vendorEmail, `${t.from} to ${t.to}`, t.status, <><button onClick={() => updateTicket(t, { status: 'approved' }, true)}>Approve</button><button onClick={() => updateTicket(t, { status: 'rejected', advertised: false }, true)}>Reject</button></>])} />; }
function ManageUsers({ users, setRole, fraud, current }) { return <Table heads={['Name', 'Email', 'Role', 'Action']} rows={users.map(u => [u.name, u.email, `${u.role}${u.fraud ? ' / fraud' : ''}`, <><button disabled={docId(u) === current} onClick={() => setRole(u, 'admin')}>Make Admin</button><button onClick={() => setRole(u, 'vendor')}>Make Vendor</button>{u.role === 'vendor' && <button onClick={() => fraud(u)}>Mark Fraud</button>}</>])} />; }
function Advertise({ tickets, updateTicket }) { const count = tickets.filter(t => t.advertised).length; return <Table heads={['Ticket', 'Route', 'Advertised', 'Toggle']} rows={tickets.map(t => [t.title, `${t.from} to ${t.to}`, t.advertised ? 'Yes' : 'No', <button disabled={!t.advertised && count >= 6} onClick={() => updateTicket(t, { advertised: !t.advertised }, true)}>{t.advertised ? 'Unadvertise' : 'Advertise'}</button>])} />; }
function Table({ heads, rows }) { return <div className="table"><table><thead><tr>{heads.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>; }
function PaymentModal({ booking, ticket, api, close, complete }) { const [intent, setIntent] = useState(null); const [error, setError] = useState(''); useEffect(() => { api('/api/payments/create-intent', { method: 'POST', body: JSON.stringify({ bookingId: docId(booking) }) }).then(setIntent).catch(e => setIntent({ demo: true, transactionId: `stripe_demo_${Date.now()}`, error: e.message })); }, [booking]); const content = !intent ? <p>Preparing Stripe payment...</p> : intent.demo || !stripePromise ? <DemoPayment intent={intent} booking={booking} ticket={ticket} complete={complete} /> : <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}><StripeForm intent={intent} booking={booking} complete={complete} setError={setError} /></Elements>; return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><div className="modal"><button className="icon modal-close" onClick={close}><X size={18} /></button><h2>Pay for {ticket?.title}</h2><p>Total amount: <b>{money((ticket?.price || 0) * booking.quantity)}</b></p>{content}{error && <p className="empty">{error}</p>}</div></div>; }
function DemoPayment({ intent, booking, ticket, complete }) { return <><p>{intent.error ? `${intent.error}. Demo payment is available until Stripe keys are configured.` : 'Stripe demo mode is active because no publishable/secret key is configured.'}</p><button className="primary wide" onClick={() => complete(booking, intent.transactionId)}>Complete demo payment</button></>; }
function StripeForm({ intent, booking, complete, setError }) { const stripe = useStripe(); const elements = useElements(); const [busy, setBusy] = useState(false); const submit = async () => { if (!stripe || !elements) return; setBusy(true); const result = await stripe.confirmPayment({ elements, redirect: 'if_required' }); setBusy(false); if (result.error) return setError(result.error.message); complete(booking, result.paymentIntent?.id || intent.transactionId); }; return <><PaymentElement /><button className="primary wide" disabled={!stripe || busy} onClick={submit}>{busy ? 'Processing...' : 'Pay with Stripe'}</button></>; }
function Footer({ go }) { return <footer><div><h3><Bus size={19} />TicketBari</h3><p>Book bus, train, launch and flight tickets easily.</p></div><div><b>Quick Links</b><button onClick={() => go('/')}>Home</button><button onClick={() => go('/tickets')}>All Tickets</button><button>Contact Us</button><button>About</button></div><div><b>Contact Info</b><span>hello@ticketbari.com</span><span>+880 1700 000000</span><span>Facebook Page / X</span></div><div><b>Payment Methods</b><span>Stripe</span><span>Visa / Mastercard</span><span>bKash demo</span></div><p>Copyright 2026 TicketBari. All rights reserved.</p></footer>; }
function ErrorPage({ go }) { return <section className="error"><ShieldCheck size={48} /><h1>Page not found</h1><p>The route you opened does not exist.</p>{go && <button className="primary" onClick={() => go('/')}>Back home</button>}</section>; }
function LoadingOverlay() { return <div className="loading-overlay" aria-live="polite"><div className="loader-ring"><i /><i /><i /></div><span>Loading TicketBari data</span></div>; }

createRoot(document.getElementById('root')).render(<App />);
