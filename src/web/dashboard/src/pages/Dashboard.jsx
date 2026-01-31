import { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import {
    Play, Pause, RotateCcw, ChevronRight, Search, Bell, ShieldCheck,
    AlertCircle, Zap, Users, MoreHorizontal, Plus, Activity, Heart,
    Wind, Brain, Thermometer, Crosshair, Map, Filter, Sliders,
    Download, Printer, Share2, Database, Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8001';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Simulated Bio-Metrics
    const [bioMetrics, setBioMetrics] = useState({
        heartRate: 72,
        bpSys: 120,
        bpDia: 80,
        o2: 98,
        temp: 37.0,
        neuralLoad: 45
    });

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/status`);
            const json = await res.json();
            setData(json);

            setHistory(prev => {
                const newEntry = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    healthy: json.healthy,
                    cancer: json.cancer,
                    efficiency: json.efficiency,
                    load: Math.random() * 20 + 30
                };
                const newHistory = [...prev, newEntry];
                if (newHistory.length > 50) newHistory.shift();
                return newHistory;
            });
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch sim status", err);
        }
    };

    // Simulate biological fluctuations
    useEffect(() => {
        const bioInterval = setInterval(() => {
            setBioMetrics(prev => ({
                heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 5)),
                bpSys: Math.max(110, Math.min(140, prev.bpSys + (Math.random() - 0.5) * 4)),
                bpDia: Math.max(70, Math.min(90, prev.bpDia + (Math.random() - 0.5) * 2)),
                o2: Math.max(95, Math.min(100, prev.o2 + (Math.random() - 0.5))),
                temp: 37.0 + (Math.random() - 0.5) * 0.2,
                neuralLoad: Math.max(20, Math.min(80, prev.neuralLoad + (Math.random() - 0.5) * 10))
            }));
        }, 1000);
        return () => clearInterval(bioInterval);
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchData, 500);
        return () => clearInterval(interval);
    }, []);

    const sendControl = async (action) => {
        await fetch(`${API_URL}/control/${action}`, { method: 'POST' });
    };

    const spawn = async (type) => {
        await fetch(`${API_URL}/spawn/${type}`, { method: 'POST' });
    };

    if (loading) return <div className="p-10 text-slate-500 font-mono">INITIALIZING DASHBOARD SYSTEMS...</div>;

    return (
        <div className="space-y-6">
            {/* TOP BAR - COMPLEX STATUS */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        <Activity size={12} className="text-emerald-500 animate-pulse" /> System Online
                        <span className="text-slate-300">|</span>
                        <span>v2.4.0-RC4</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mission Control Center</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Server Latency</div>
                        <div className="font-mono font-bold text-emerald-600">12ms <span className="text-slate-300">stable</span></div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                    <div className="flex gap-2">
                        <button onClick={() => sendControl('start')} disabled={data.running} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${data.running ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:shadow-emerald-100 hover:shadow-md'}`}>
                            <Play size={14} /> INITIALIZE
                        </button>
                        <button onClick={() => sendControl('stop')} disabled={!data.running} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${!data.running ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:shadow-amber-100 hover:shadow-md'}`}>
                            <Pause size={14} /> HALT
                        </button>
                        <button onClick={() => sendControl('reset')} className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                            <RotateCcw size={14} /> RESET
                        </button>
                    </div>
                </div>
            </header>

            {/* BIO-TELEMETRY GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <BioCard label="Heart Rate" value={Math.round(bioMetrics.heartRate)} unit="BPM" icon={Heart} color="text-rose-500" trend="+2%" />
                <BioCard label="Blood Pressure" value={`${Math.round(bioMetrics.bpSys)}/${Math.round(bioMetrics.bpDia)}`} unit="mmHg" icon={Activity} color="text-rose-500" />
                <BioCard label="Oxygen Level" value={Math.round(bioMetrics.o2)} unit="%" icon={Wind} color="text-sky-500" safe />
                <BioCard label="Core Temp" value={bioMetrics.temp.toFixed(1)} unit="°C" icon={Thermometer} color="text-amber-500" />
                <BioCard label="Neural Load" value={Math.round(bioMetrics.neuralLoad)} unit="Hz" icon={Brain} color="text-purple-500" />
                <BioCard label="Nano-Integrity" value="99.9" unit="%" icon={ShieldCheck} color="text-emerald-500" safe />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN - MAIN CHARTING */}
                <div className="lg:col-span-2 space-y-6">
                    {/* PRIMARY CHART ARRAY */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                        <div className="flex bg-slate-50/50 border-b border-slate-100 p-2 gap-2">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Activity} label="Population Dynamics" />
                            <TabButton active={activeTab === 'efficiency'} onClick={() => setActiveTab('efficiency')} icon={Zap} label="Fleet Efficiency" />
                            <TabButton active={activeTab === 'network'} onClick={() => setActiveTab('network')} icon={Share2} label="Network Traffic" />
                        </div>

                        <div className="p-4 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history}>
                                    <defs>
                                        <linearGradient id="healthyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="cancerGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="healthy" stackId="1" stroke="#10b981" fill="url(#healthyGradient)" />
                                    <Area type="monotone" dataKey="cancer" stackId="1" stroke="#f43f5e" fill="url(#cancerGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* SECTOR ANALYSIS & HEATMAP */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Map size={14} /> Sector Density</h3>
                                <Filter size={14} className="text-slate-400" />
                            </div>
                            <div className="grid grid-cols-4 gap-1 h-32">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className={`rounded-sm transition-all duration-500 ${Math.random() > 0.7 ? 'bg-sky-100' : Math.random() > 0.9 ? 'bg-rose-100' : 'bg-slate-50'}`}></div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Database size={14} /> Resource Allocation</h3>
                                <Download size={14} className="text-slate-400" />
                            </div>
                            <div className="space-y-3">
                                <ProgressBar label="Computing Power" value={78} color="bg-indigo-500" />
                                <ProgressBar label="Bandwidth" value={45} color="bg-cyan-500" />
                                <ProgressBar label="Energy Reserves" value={92} color="bg-emerald-500" />
                                <ProgressBar label="Active Threads" value={23} color="bg-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - COMMAND CENTER */}
                <div className="space-y-6">
                    {/* THREAT MONITOR */}
                    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle size={120} /></div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current DEFCON</h3>
                        <div className="text-4xl font-black text-rose-500 tracking-tighter mb-4">LEVEL 4</div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Threat Vectors</span>
                                <span className="text-rose-400 font-mono font-bold">{data.cancer} DETECTED</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Containment</span>
                                <span className="text-emerald-400 font-mono font-bold">94.2%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Auto-Response</span>
                                <span className="text-amber-400 font-mono font-bold">ENGAGED</span>
                            </div>
                        </div>
                    </div>

                    {/* TACTICAL DEPLOYMENT */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2"><Crosshair size={14} /> Tactical Deployment</h3>

                        <div className="space-y-4">
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-rose-800">PATHOGEN_INJECTOR.exe</span>
                                    <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 rounded font-mono">ROOT_AUTH</span>
                                </div>
                                <button onClick={() => spawn('cancer')} className="w-full py-2 bg-white border border-rose-200 text-rose-600 rounded text-xs font-bold hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                    EXECUTE INJECTION
                                </button>
                            </div>

                            <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-sky-800">NANO_REPAIR_UNIT.deploy</span>
                                    <span className="text-[10px] bg-sky-200 text-sky-800 px-1.5 rounded font-mono">READY</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div className="bg-white p-1.5 rounded border border-sky-100 text-[10px] text-center text-slate-500">
                                        <div className="font-bold text-slate-700">MK-IV</div>
                                        Model
                                    </div>
                                    <div className="bg-white p-1.5 rounded border border-sky-100 text-[10px] text-center text-slate-500">
                                        <div className="font-bold text-slate-700">AGGRESSIVE</div>
                                        Mode
                                    </div>
                                </div>
                                <button onClick={() => spawn('bot')} className="w-full py-2 bg-sky-600 text-white rounded text-xs font-bold hover:bg-sky-700 transition-all shadow-md shadow-sky-200">
                                    DEPLOY UNIT
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TERMINAL PREVIEW */}
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-400 overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                            <Terminal size={12} /> <span className="uppercase font-bold">System Kernel</span>
                        </div>
                        <div className="space-y-1 opacity-70">
                            <div>> INIT_VIZUALIZATION_MATRIX... OK</div>
                            <div>> CONNECTING_TO_HOST... OK</div>
                            <div>> BIOMETRIC_STREAM_ESTABLISHED</div>
                            <div className="text-emerald-500">> SYSTEM_READY</div>
                            <div className="animate-pulse">_</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function BioCard({ label, value, unit, icon: Icon, color, trend, safe }) {
    return (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group hover:border-slate-300 transition-all">
            <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={40} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">{label}</div>
            <div className="z-10">
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold tracking-tight ${safe ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
                </div>
                {trend && <div className="text-[10px] text-emerald-500 font-bold mt-1">{trend}</div>}
            </div>
        </div>
    )
}

function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
        >
            <Icon size={14} /> {label}
        </button>
    )
}

function ProgressBar({ label, value, color }) {
    return (
        <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    )
}
