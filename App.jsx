import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Use Environment Variable for Cloud, or fallback to local network for Dev
// FORZAMOS LA URL DE INTELIGENCIA (RENDER)
const API_URL = 'https://mml-control-backend.onrender.com';

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
                    <NavButton
                        active={view === 'alerts'}
                        onClick={() => setView('alerts')}
                        icon="🚨"
                        label="Alertas"
                    />
                    <NavButton
                        active={view === 'reports'}
                        onClick={() => setView('reports')}
                        icon="📊"
                        label="Informes"
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
                    {view === 'alerts' && <AlertsView token={token} />}
                    {view === 'reports' && <ReportsView token={token} />}
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
    const [mapCenter, setMapCenter] = useState([42.5987, -5.5671]); // León, España

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/workers-map`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMarkers(res.data);
                setWorkers(res.data);

                // Dynamic map centering: if workers active, center on them
                if (res.data.length > 0) {
                    const avgLat = res.data.reduce((sum, m) => sum + m.lat, 0) / res.data.length;
                    const avgLng = res.data.reduce((sum, m) => sum + m.lng, 0) / res.data.length;
                    setMapCenter([avgLat, avgLng]);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetch(); // Initial
        const interval = setInterval(fetch, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [token]);

    // Vehicle icons
    const vehicleIcons = {
        car: '🚗',
        motorcycle: '🏍️',
        scooter: '🛴'
    };

    // Function to create a vehicle-based numbered icon
    const createVehicleIcon = (vehicleType, number) => {
        const emoji = vehicleIcons[vehicleType] || vehicleIcons.car;
        return L.divIcon({
            className: 'custom-vehicle-icon',
            html: `
                <div style="
                    background: #00ffa3; 
                    border-radius: 50%; 
                    padding: 8px; 
                    color: black; 
                    font-weight: bold; 
                    text-align: center; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    border: 2px solid #000;
                ">
                    <div style="font-size: 20px;">${emoji}</div>
                    <div style="font-size: 12px;">#${number}</div>
                </div>
            `,
            iconSize: [60, 70],
            iconAnchor: [30, 35],
            popupAnchor: [0, -35]
        });
    };

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-[#00ffa3]/20 shadow-[0_0_20px_rgba(0,255,163,0.05)] relative">
            <div className="absolute top-4 right-4 z-[400] bg-black/80 backdrop-blur text-[#00ffa3] px-4 py-2 rounded-lg border border-[#00ffa3]/30 font-bold text-xs tracking-widest shadow-lg">
                VISTA SATELITAL ACTIVA
            </div>
            <MapContainer center={mapCenter} zoom={14} style={{ height: "100%", width: "100%" }} key={mapCenter.join(',')}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {markers.map((m, i) => (
                    <Marker
                        key={i}
                        position={[m.lat, m.lng]}
                        icon={createVehicleIcon(m.vehicle_type || 'car', m.worker_number || '?')}
                    >
                        <Popup className="custom-popup">
                            <div className="text-center bg-gray-900 text-white p-2 rounded">
                                <span className="text-lg font-bold block text-[#00ffa3]">{m.user}</span>
                                <span className="text-gray-400 text-xs">#{m.worker_number} | {vehicleIcons[m.vehicle_type || 'car']}</span>
                                <span className="text-gray-400 text-xs block">{new Date(m.last_update).toLocaleTimeString()}</span>
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
    const [form, setForm] = useState({ email: '', password: '', full_name: '', worker_number: '', vehicle_type: 'car' });
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
            setForm({ email: '', password: '', full_name: '', worker_number: '', vehicle_type: 'car' });
            fetchWorkers();
        } catch (err) {
            setMsg("Error creating worker: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleDelete = async (workerId, workerName) => {
        if (window.confirm(`¿Estás seguro de eliminar a ${workerName}?`)) {
            try {
                await axios.delete(`${API_URL}/admin/workers/${workerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMsg(`Worker ${workerName} deleted successfully!`);
                fetchWorkers();
            } catch (err) {
                setMsg("Error deleting worker: " + (err.response?.data?.detail || err.message));
            }
        }
    };

    const vehicleIcons = {
        car: '🚗',
        motorcycle: '🏍️',
        scooter: '🛴'
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Worker Management</h2>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Add New Worker</h3>
                {msg && <div className={`p-4 mb-4 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>}
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    <input className="border border-gray-300 p-3 rounded text-gray-900 font-medium placeholder-gray-500" placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                    <input className="border border-gray-300 p-3 rounded text-gray-900 font-medium placeholder-gray-500" type="number" placeholder="Worker Number (#)" value={form.worker_number} onChange={e => setForm({ ...form, worker_number: e.target.value })} required />
                    <input className="border border-gray-300 p-3 rounded text-gray-900 font-medium placeholder-gray-500" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input className="border border-gray-300 p-3 rounded text-gray-900 font-medium placeholder-gray-500" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <select
                        className="border border-gray-300 p-3 rounded text-gray-900 font-medium col-span-2"
                        value={form.vehicle_type}
                        onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
                    >
                        <option value="car">🚗 Coche</option>
                        <option value="motorcycle">🏍️ Moto</option>
                        <option value="scooter">🛴 Patinete</option>
                    </select>
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
                            <th className="p-4 border-b text-gray-900 font-bold">#</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Name</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Email</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Vehículo</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Role</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Status</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workers.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50">
                                <td className="p-4 border-b font-bold text-gray-600">#{w.worker_number}</td>
                                <td className="p-4 border-b font-medium text-gray-900">{w.full_name}</td>
                                <td className="p-4 border-b text-gray-700">{w.email}</td>
                                <td className="p-4 border-b text-2xl">{vehicleIcons[w.vehicle_type || 'car']}</td>
                                <td className="p-4 border-b">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase">{w.role}</span>
                                </td>
                                <td className="p-4 border-b">
                                    <span className={`px-2 py-1 rounded-full text-xs ${w.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {w.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 border-b">
                                    {w.role !== 'admin' && (
                                        <button
                                            onClick={() => handleDelete(w.id, w.full_name)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm font-bold"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    )}
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
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

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

    // Filter shifts based on search and date
    const filteredShifts = shifts.filter(s => {
        const matchesSearch = s.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.worker_number.toString().includes(searchTerm);
        const matchesDate = !dateFilter || new Date(s.start_time).toLocaleDateString('es-ES') === new Date(dateFilter).toLocaleDateString('es-ES');
        return matchesSearch && matchesDate;
    });

    // Export to PDF (using browser print)
    const handleExportPDF = () => {
        const printWindow = window.open('', '_blank');
        const tableHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Historial de Jornadas - MML CONTROL</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #00ffa3; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #00ffa3; color: black; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>📊 HISTORIAL DE JORNADAS</h1>
                <p><strong>Fecha de exportación:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Trabajador</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Duración</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredShifts.map(s => {
            const start = new Date(s.start_time);
            const end = s.end_time ? new Date(s.end_time) : null;
            const duration = end ? ((end - start) / 1000 / 60 / 60).toFixed(2) + ' hrs' : '-';
            return `
                                <tr>
                                    <td><strong>${s.worker_name}</strong><br><small>#${s.worker_number}</small></td>
                                    <td>${start.toLocaleString('es-ES')}</td>
                                    <td>${end ? end.toLocaleString('es-ES') : '-'}</td>
                                    <td>${duration}</td>
                                    <td>${s.status.toUpperCase()}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
                <div class="footer">
                    <p>MML-CONTROL © ${new Date().getFullYear()} | Sistema de Control de Jornadas</p>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(tableHTML);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Shift History</h2>

            {/* Search and Filter Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">🔍 Buscar por Trabajador o Número</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nombre o número de trabajador..."
                            className="w-full border border-gray-300 p-3 rounded text-gray-900 font-medium placeholder-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">📅 Filtrar por Fecha</label>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded text-gray-900 font-medium"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                        <strong>Mostrando {filteredShifts.length}</strong> de {shifts.length} jornadas
                    </p>
                    <button
                        onClick={handleExportPDF}
                        className="bg-[#00ffa3] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00e692] transition shadow-lg flex items-center gap-2"
                    >
                        📄 Exportar PDF
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-4 border-b text-gray-900 font-bold">Worker</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Start Time</th>
                            <th className="p-4 border-b text-gray-900 font-bold">End Time</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Duration</th>
                            <th className="p-4 border-b text-gray-900 font-bold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShifts.map((s) => {
                            const start = new Date(s.start_time);
                            const end = s.end_time ? new Date(s.end_time) : null;
                            const duration = end ? ((end - start) / 1000 / 60 / 60).toFixed(2) + ' hrs' : '-';

                            return (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="p-4 border-b">
                                        <div className="font-bold text-gray-900">{s.worker_name}</div>
                                        <div className="text-xs text-gray-600">#{s.worker_number}</div>
                                    </td>
                                    <td className="p-4 border-b text-gray-900">{start.toLocaleString('es-ES')}</td>
                                    <td className="p-4 border-b text-gray-900">{end ? end.toLocaleString('es-ES') : '-'}</td>
                                    <td className="p-4 border-b text-gray-900 font-medium">{duration}</td>
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
                {filteredShifts.length === 0 && <div className="p-8 text-center text-gray-600 font-medium">No se encontraron jornadas que coincidan con tu búsqueda.</div>}
            </div>
        </div>
    );
}

// Alerts View - Show open shifts warnings
function AlertsView({ token }) {
    const [openShifts, setOpenShifts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOpenShifts();
        const interval = setInterval(fetchOpenShifts, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchOpenShifts = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/alerts/open_shifts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpenShifts(res.data);
            setLoading(false);
        } catch (e) {
            console.error("Error fetching alerts", e);
            setLoading(false);
        }
    };

    const handleCloseShift = async (shiftId) => {
        if (window.confirm("¿Cerrar esta jornada manualmente?")) {
            try {
                // Close shift manually by updating it
                await axios.post(`${API_URL}/shifts/end`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchOpenShifts();
            } catch (e) {
                console.error("Error closing shift", e);
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">🚨 Alertas de Jornadas</h2>
                {openShifts.length > 0 && (
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                        {openShifts.length} Alerta{openShifts.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando...</div>
            ) : openShifts.length === 0 ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">¡Todo en orden!</h3>
                    <p className="text-green-700">No hay jornadas abiertas con más de 12 horas.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {openShifts.map((shift) => (
                        <div key={shift.id} className="bg-red-50 border-2 border-red-300 rounded-lg p-6 flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">⚠️</span>
                                    <h3 className="text-lg font-bold text-red-900">{shift.worker_name}</h3>
                                    <span className="text-sm text-gray-600">#{shift.worker_number}</span>
                                </div>
                                <div className="text-sm text-red-700">
                                    <strong>Inicio:</strong> {new Date(shift.start_time).toLocaleString('es-ES')}
                                </div>
                                <div className="text-sm font-bold text-red-900 mt-1">
                                    ⏰ Abierta desde hace {shift.hours_open.toFixed(1)} horas
                                </div>
                            </div>
                            <button
                                onClick={() => handleCloseShift(shift.id)}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
                            >
                                Cerrar Manualmente
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Reports View - Hours summary and PDF export
function ReportsView({ token }) {
    const [summary, setSummary] = useState([]);
    const [filters, setFilters] = useState({
        worker_id: '',
        start_date: '',
        end_date: ''
    });
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSummary = async () => {
        try {
            const params = {};
            if (filters.worker_id) params.worker_id = filters.worker_id;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const res = await axios.get(`${API_URL}/admin/reports/hours_summary`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setSummary(res.data);
        } catch (e) {
            console.error("Error fetching summary", e);
        }
    };

    const exportPDF = () => {
        window.print();
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">📊 Informes de Horas</h2>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Filtros</h3>
                <div className="grid grid-cols-3 gap-4">
                    <select
                        className="border border-gray-300 p-3 rounded text-gray-900"
                        value={filters.worker_id}
                        onChange={(e) => setFilters({ ...filters, worker_id: e.target.value })}
                    >
                        <option value="">Todos los trabajadores</option>
                        {workers.map(w => (
                            <option key={w.id} value={w.id}>#{w.worker_number} - {w.full_name}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="border border-gray-300 p-3 rounded text-gray-900"
                        value={filters.start_date}
                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                        placeholder="Fecha inicio"
                    />
                    <input
                        type="date"
                        className="border border-gray-300 p-3 rounded text-gray-900"
                        value={filters.end_date}
                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                        placeholder="Fecha fin"
                    />
                </div>
                <div className="mt-4 flex gap-4">
                    <button
                        onClick={fetchSummary}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex-1"
                    >
                        🔍 Generar Informe
                    </button>
                    {summary.length > 0 && (
                        <button
                            onClick={exportPDF}
                            className="bg-[#00ffa3] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00e692] transition"
                        >
                            📄 Exportar PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Table */}
            {summary.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-4 border-b text-gray-900 font-bold">#</th>
                                <th className="p-4 border-b text-gray-900 font-bold">Trabajador</th>
                                <th className="p-4 border-b text-gray-900 font-bold">Jornadas</th>
                                <th className="p-4 border-b text-gray-900 font-bold">Horas Totales</th>
                                <th className="p-4 border-b text-gray-900 font-bold">Promedio/Jornada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((s, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 border-b font-bold text-gray-600">#{s.worker_number}</td>
                                    <td className="p-4 border-b font-medium text-gray-900">{s.worker_name}</td>
                                    <td className="p-4 border-b text-gray-900">{s.shift_count}</td>
                                    <td className="p-4 border-b text-gray-900 font-bold">{s.total_hours.toFixed(2)} hrs</td>
                                    <td className="p-4 border-b text-gray-700">{(s.total_hours / s.shift_count).toFixed(2)} hrs</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {summary.length === 0 && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Selecciona filtros y haz clic en "Generar Informe"</p>
                </div>
            )}
        </div>
    );
}

export default App;

