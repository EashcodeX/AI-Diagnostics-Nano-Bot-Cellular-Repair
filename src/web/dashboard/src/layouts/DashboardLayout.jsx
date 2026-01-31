import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Activity, Users, Settings, LogOut, Cpu, Wifi, ShieldCheck, TerminalSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8001';

export default function DashboardLayout() {
    const location = useLocation();
    const [stats, setStats] = useState({ healthy: 0, cancer: 0, bots: 0 });
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/status`);
                const data = await res.json();
                setStats({ healthy: data.healthy, cancer: data.cancer, bots: data.active_bots });

                if (Math.random() > 0.9) {
                    setLogs(prev => [`[SYS] Heartbeat OK - ${Date.now().toString().slice(-4)}`, ...prev].slice(0, 8));
                }
            } catch (err) { }
        };
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900 overflow-hidden">

            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shrink-0 shadow-xl">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <div className="h-8 w-8 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">N</div>
                    <div>
                        <div className="font-bold text-sm tracking-tight text-slate-900">NanoOS Defense</div>
                        <div className="text-[10px] text-slate-400 font-mono">SECURE CONNECTION</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    {/* Navigation */}
                    <nav className="space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Main Menu</div>
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
                        <NavItem to="/monitor" icon={Activity} label="Live Simulation" active={location.pathname === '/monitor'} />
                        <NavItem to="/fleet" icon={Users} label="Fleet Management" active={location.pathname === '/fleet'} />
                        <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
                    </nav>

                    <div className="h-px bg-slate-100 mx-2"></div>

                    {/* Global Metrics */}
                    <div className="px-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Activity size={10} /> Biological Status
                        </h4>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">Integrity</span>
                                    <span className="text-emerald-600 font-bold">{Math.round((stats.healthy / (stats.healthy + stats.cancer || 1)) * 100)}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${(stats.healthy / (stats.healthy + stats.cancer || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">Threat Level</span>
                                    <span className="text-rose-600 font-bold">{stats.cancer} units</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, stats.cancer * 2)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mx-2"></div>

                    {/* System Resources */}
                    <div className="px-1">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Cpu size={10} /> Server Load
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                                <div className="text-[10px] text-slate-400 mb-1">CPU</div>
                                <div className="text-sm font-mono font-bold text-slate-700">14%</div>
                                <div className="h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-sky-500 w-[14%]"></div>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded">
                                <div className="text-[10px] text-slate-400 mb-1">RAM</div>
                                <div className="text-sm font-mono font-bold text-slate-700">2.1GB</div>
                                <div className="h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[45%]"></div>
                                </div>
                            </div>
                        </div>
                        {/* Network Status */}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded">
                            <div className="flex items-center gap-2">
                                <Wifi size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-600">ONLINE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={12} className="text-sky-500" />
                                <span className="text-[10px] font-bold text-slate-600">SECURE</span>
                            </div>
                        </div>
                    </div>

                    {/* Mission Logs */}
                    <div className="flex-1 min-h-[120px] bg-slate-900 rounded-lg p-3 font-mono text-[10px] text-emerald-400/80 overflow-hidden flex flex-col shadow-inner">
                        <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-1">
                            <TerminalSquare size={10} /> SYSTEM LOGS
                        </div>
                        <div className="overflow-y-auto space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="opacity-80 hover:opacity-100 line-clamp-1">{log}</div>
                            ))}
                            <div className="opacity-50">... Awaiting Data</div>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">DR</div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">Dr. Eash</div>
                            <div className="text-[10px] text-slate-500 truncate">Administrator</div>
                        </div>
                        <LogOut size={12} className="text-slate-400" />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <main className="flex-1 ml-72 p-0 max-w-full h-screen overflow-hidden bg-slate-50/50">
                <Outlet />
            </main>
        </div>
    );
}

function NavItem({ to, icon: Icon, label, active }) {
    return (
        <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-all duration-200 group ${active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Icon size={16} className={`transition-colors ${active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {label}
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
        </Link>
    )
}
