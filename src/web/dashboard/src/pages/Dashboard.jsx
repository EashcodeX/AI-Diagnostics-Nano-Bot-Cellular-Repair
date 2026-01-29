import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, ChevronRight, Search, Bell, ShieldCheck, AlertCircle, Zap, Users, MoreHorizontal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8000';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    efficiency: json.efficiency
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

    useEffect(() => {
        const interval = setInterval(fetchData, 500); // Slower poll for main dashboard
        return () => clearInterval(interval);
    }, []);

    const sendControl = async (action) => {
        await fetch(`${API_URL}/control/${action}`, { method: 'POST' });
    };

    const spawn = async (type) => {
        await fetch(`${API_URL}/spawn/${type}`, { method: 'POST' });
    };

    if (loading) return <div className="p-10 text-slate-500">Loading System Metrics...</div>;

    return (
        <div>
            {/* HEADER */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <nav className="flex items-center text-sm text-slate-500 mb-1">
                        <span>Overview</span>
                        <ChevronRight size={14} className="mx-2" />
                        <span className="font-medium text-slate-900">Real-time Analysis</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900">Mission Control</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 w-64 bg-white shadow-sm transition-all" />
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg bg-white shadow-sm text-slate-500 hover:text-slate-700 relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>
            </header>

            {/* STATUS BAR */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${data.running ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {data.running ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">System Status</div>
                        <div className={`text-lg font-bold flex items-center gap-2 ${data.running ? 'text-slate-900' : 'text-slate-500'}`}>
                            {data.running ? 'Active Simulation' : 'Paused / Standby'}
                            {data.running && <span className="relative flex h-2.5 w-2.5 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <ActionButton onClick={() => sendControl('start')} icon={Play} label="Start" primary disabled={data.running} />
                    <ActionButton onClick={() => sendControl('stop')} icon={Pause} label="Pause" disabled={!data.running} />
                    <ActionButton onClick={() => sendControl('reset')} icon={RotateCcw} label="Reset" />
                </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Health Integrity" value={`${Math.round((data.healthy / data.total_cells) * 100)}%`} icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50" />
                <MetricCard title="Threat Detected" value={data.cancer} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" label="Active Cells" />
                <MetricCard title="Bot Efficiency" value={`${data.efficiency}%`} icon={Zap} color="text-amber-600" bg="bg-amber-50" />
                <MetricCard title="Active Fleet" value={data.active_bots} icon={Users} color="text-sky-600" bg="bg-sky-50" label={`Total: ${data.total_bots}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* MAIN CHART */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Population Trends</h3>
                            <p className="text-sm text-slate-500">Real-time analysis of healthy vs pathogen cells</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Healthy
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Cancer
                            </span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
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
                                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} dy={10} minTickGap={30} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} dx={-10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <Area type="monotone" dataKey="healthy" stroke="#10b981" strokeWidth={2} fill="url(#healthyGradient)" animationDuration={500} />
                                <Area type="monotone" dataKey="cancer" stroke="#f43f5e" strokeWidth={2} fill="url(#cancerGradient)" animationDuration={500} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ACTIONS PANEL */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Quick Actions</h3>
                    <p className="text-sm text-slate-500 mb-6">Manually intervene in simulation</p>

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-slate-200 transition-all">
                            <div>
                                <div className="font-semibold text-slate-700 text-sm">Inject Pathogen</div>
                                <div className="text-xs text-slate-500">Add 1x Cancer Cell</div>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => spawn('cancer')} className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-rose-300 group-hover:text-rose-600 transition-colors shadow-sm">
                                <Plus size={18} />
                            </motion.button>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-slate-200 transition-all">
                            <div>
                                <div className="font-semibold text-slate-700 text-sm">Deploy Nano-Bot</div>
                                <div className="text-xs text-slate-500">Add 1x Repair Unit</div>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => spawn('bot')} className="p-2 bg-white border border-slate-200 rounded-lg group-hover:border-sky-300 group-hover:text-sky-600 transition-colors shadow-sm">
                                <Plus size={18} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                            <span>Server Latency</span>
                            <span className="font-mono text-slate-600">12ms</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[92%] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ onClick, icon: Icon, label, primary, disabled }) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
         ${primary
                    ? 'bg-sky-600 text-white hover:bg-sky-700 border border-transparent box-content hover:shadow-md hover:shadow-sky-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
        >
            <Icon size={16} />
            {label}
        </motion.button>
    )
}

function MetricCard({ title, value, icon: Icon, color, bg, label }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
                    <Icon size={20} />
                </div>
                <MoreHorizontal size={16} className="text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
            <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-slate-500">{title}</span>
                    {label && <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">{label}</span>}
                </div>
            </div>
        </div>
    )
}
