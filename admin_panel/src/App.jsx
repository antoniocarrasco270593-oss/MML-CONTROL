import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Use Environment Variable for Cloud, or fallback to local network for Dev
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [workers, setWorkers] = useState([]);

    if (!token) return <Login setToken={setToken} />;

    // Simple Router State
    const [view, setView] = useState('map'); // 'map', 'workers', 'history'

    return (
        <div className="flex h-screen bg-mml-dark text-mml-text font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-mml-card border-r border-gray-800 p-6 flex flex-col shadow-2xl z-10">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-xl font-bold tracking-widest text-[#00ffa3] drop-shadow-[0_0_10px_rgba(0,255,163,0.5)]">
                        MML CONTROL
                    </h1>
                    <div className="h-3 w-3 rounded-full bg-[#00ffa3] shadow-[0_0_10px_#00ffa3]"></div>
                </div>

                <nav className="flex-1 space-y-4">
                    <NavButton
                        active={view === 'map'}
                        onClick={() => setView('map')}
                        icon="🗺️"
                        label="Mapa en Vivo"
                    />
                    <NavButton
                        active={view === 'workers'}
                        onClick={() => setView('workers')}
                        icon="👥"
                        label="Personal"
                    />
                    <NavButton
                        active={view === 'history'}
                        onClick={() => setView('history')}
                        icon="🕒"
                        label="Historial"
                    />
                </nav>

                <div className="mb-8 p-4 bg-black/20 rounded-xl border border-white/5">
                    <h3 className="text-gray-400 uppercase text-[10px] font-bold tracking-widest mb-3">CONECTADOS AHORA</h3>
                    <ActiveWorkersList workers={workers} />
                </div>

                <div className="mt-auto">
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        setToken(null);
                    }} className="flex items-center justify-center w-full py-3 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-medium text-sm">
                        CERRAR SESIÓN
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-mml-dark to-transparent z-10 pointer-events-none"></div>

                <div className="h-full overflow-auto p-6 relative z-0">
                    {view === 'map' && <LiveMap setWorkers={setWorkers} token={token} />}
                    {view === 'workers' && <WorkersManagement token={token} />}
                    {view === 'history' && <ShiftsHistory token={token} />}
                </div>
            </div>
        </div>
    );
}

// Helper Components for Cleaner Code
function NavButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
                ? 'bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30 shadow-[0_0_15px_rgba(0,255,163,0.1)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{icon}</span>
            <span className="font-medium text-sm tracking-wide">{label}</span>
        </button>
    );
}

// Extracted for cleaner code
function ActiveWorkersList({ workers }) {
    return (
        <ul className="space-y-3">
            {workers.map((w, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold border border-white/10">
                            {w.user.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-200">{w.user}</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#00ffa3] shadow-[0_0_8px_#00ffa3]"></span>
                </li>
            ))}
            {workers.length === 0 && <div className="text-gray-500 text-xs text-center py-2">Nadie en ruta</div>}
        </ul>
    )
}

function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const res = await axios.post(`${API_URL}/token`, formData);
            const t = res.data.access_token;
            localStorage.setItem('token', t);
            setToken(t);
        } catch (err) {
            alert("Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-mml-dark relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00ffa3] opacity-20 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 opacity-20 blur-[100px] rounded-full"></div>

            <form onSubmit={handleLogin} className="relative bg-mml-card p-10 rounded-2xl shadow-2xl w-96 border border-white/5 backdrop-blur-sm z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-widest mb-2">MML CONTROL</h1>
                    <p className="text-[#00ffa3] text-sm font-medium tracking-wide">ACCESO SEGURO</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Email Corporativo</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ffa3] focus:ring-1 focus:ring-[#00ffa3] transition-all"
                            placeholder="usuario@mml.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">Contraseña</label>
                        <input
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00ffa3] focus:ring-1 focus:ring-[#00ffa3] transition-all"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full bg-[#00ffa3] text-black font-bold p-3 rounded-lg hover:bg-[#00e692] hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all transform hover:scale-[1.02]">
                        INICIAR SISTEMA
                    </button>
                </div>
            </form>
        </div>
    );
}

function LiveMap({ setWorkers, token }) {
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/workers-map`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMarkers(res.data);
                setWorkers(res.data);
            } catch (e) {
                console.error(e);
            }
        };

        fetch(); // Initial
        const interval = setInterval(fetch, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [token]);


    // Function to create a numbered icon dynamically
    const createNumberedIcon = (number) => {
        return L.divIcon({
            className: 'custom-div-icon', // Leaflet requires a class, but we use internal HTML
            html: `<div class="numbered-marker">${number}</div>`,
            iconSize: [50, 50], // Larger circle
            iconAnchor: [25, 25], // Center point
            popupAnchor: [0, -25]
        });
    };

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-[#00ffa3]/20 shadow-[0_0_20px_rgba(0,255,163,0.05)] relative">
            <div className="absolute top-4 right-4 z-[400] bg-black/80 backdrop-blur text-[#00ffa3] px-4 py-2 rounded-lg border border-[#00ffa3]/30 font-bold text-xs tracking-widest shadow-lg">
                VISTA SATELITAL ACTIVA
            </div>
            <MapContainer center={[40.4168, -3.7038]} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {markers.map((m, i) => (
                    <Marker key={i} position={[m.lat, m.lng]} icon={createNumberedIcon(m.worker_number || '?')}>
                        <Popup className="custom-popup">
                            <div className="text-center bg-gray-900 text-white p-2 rounded">
                                <span className="text-lg font-bold block text-[#00ffa3]">{m.user}</span>
                                <span className="text-gray-400 text-xs">{new Date(m.last_update).toLocaleTimeString()}</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

function WorkersManagement({ token }) {
    const [workers, setWorkers] = useState([]);
    const [form, setForm] = useState({ email: '', password: '', full_name: '', worker_number: '' });
    const [msg, setMsg] = useState('');

    const fetchWorkers = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(res.data);
        } catch (e) {
            console.error("Error fetching workers", e);
        }
    };

    useEffect(() => { fetchWorkers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/register`, {
                ...form,
                worker_number: parseInt(form.worker_number)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg("Worker created successfully!");
            setForm({ email: '', password: '', full_name: '', worker_number: '' });
            fetchWorkers(); // Refresh list
        } catch (err) {
            setMsg("Error creating worker: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Worker Management</h2>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">Add New Worker</h3>
                {msg && <div className={`p-4 mb-4 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <input className="border p-2 rounded" placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                    <input className="border p-2 rounded" type="number" placeholder="Worker Number (#)" value={form.worker_number} onChange={e => setForm({ ...form, worker_number: e.target.value })} required />
                    <input className="border p-2 rounded" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input className="border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <div className="col-span-2">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition w-full">Create Worker</button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-4 border-b">#</th>
                            <th className="p-4 border-b">Name</th>
                            <th className="p-4 border-b">Email</th>
                            <th className="p-4 border-b">Role</th>
                            <th className="p-4 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workers.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b font-bold text-gray-600">#{w.worker_number}</td>
                                <td className="p-4 border-b font-medium">{w.full_name}</td>
                                <td className="p-4 border-b text-gray-500">{w.email}</td>
                                <td className="p-4 border-b">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase">{w.role}</span>
                                </td>
                                <td className="p-4 border-b">
                                    <span className={`px-2 py-1 rounded-full text-xs ${w.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {w.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {workers.length === 0 && <div className="p-8 text-center text-gray-500">No workers found.</div>}
            </div>
        </div>
    );
}

function ShiftsHistory({ token }) {
    const [shifts, setShifts] = useState([]);

    useEffect(() => {
        const fetchShifts = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/shifts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Sort by start time desc
                const sorted = res.data.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
                setShifts(sorted);
            } catch (e) {
                console.error("Error fetching shifts", e);
            }
        };
        fetchShifts();
    }, [token]);

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Shift History</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-4 border-b">Worker</th>
                            <th className="p-4 border-b">Start Time</th>
                            <th className="p-4 border-b">End Time</th>
                            <th className="p-4 border-b">Duration</th>
                            <th className="p-4 border-b">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map((s) => {
                            const start = new Date(s.start_time);
                            const end = s.end_time ? new Date(s.end_time) : null;
                            const duration = end ? ((end - start) / 1000 / 60 / 60).toFixed(2) + ' hrs' : '-';

                            return (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="p-4 border-b">
                                        <div className="font-bold">{s.worker_name}</div>
                                        <div className="text-xs text-gray-500">#{s.worker_number}</div>
                                    </td>
                                    <td className="p-4 border-b">{start.toLocaleString()}</td>
                                    <td className="p-4 border-b">{end ? end.toLocaleString() : '-'}</td>
                                    <td className="p-4 border-b">{duration}</td>
                                    <td className="p-4 border-b">
                                        <span className={`px-2 py-1 rounded-full text-xs uppercase ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {shifts.length === 0 && <div className="p-8 text-center text-gray-500">No history found.</div>}
            </div>
        </div>
    );
}

export default App;
