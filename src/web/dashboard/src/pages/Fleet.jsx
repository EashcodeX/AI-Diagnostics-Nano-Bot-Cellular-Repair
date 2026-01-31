import { useState } from 'react';
import { Users, Battery, Radio, Search, Filter, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Fleet() {
    const [filter, setFilter] = useState('all');

    const bots = Array.from({ length: 12 }).map((_, i) => ({
        id: `NB-${2040 + i}`,
        status: i === 3 ? 'maintenance' : i === 7 ? 'critical' : 'active',
        battery: Math.floor(Math.random() * 60) + 40,
        task: i % 2 === 0 ? 'Patrol Sector A' : 'Idle / Charging',
        location: `[${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}]`
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Management</h1>
                    <p className="text-sm text-slate-500">Real-time telemetry and control for deployed Nano-Units.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search Unit ID..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64 shadow-sm" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm shadow-sm transition-all">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-md transition-all">
                        <Zap size={16} /> Deploy New Unit
                    </button>
                </div>
            </div>

            {/* Fleet Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Units</div>
                        <div className="text-2xl font-bold text-slate-900">12</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg text-slate-400"><Users size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active</div>
                        <div className="text-2xl font-bold text-emerald-600">10</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Maintenance</div>
                        <div className="text-2xl font-bold text-amber-600">1</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Critical</div>
                        <div className="text-2xl font-bold text-rose-600">1</div>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-lg text-rose-600"><Battery size={20} /></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold">Unit ID</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Battery Integrity</th>
                                <th className="px-6 py-4 font-bold">Current Directive</th>
                                <th className="px-6 py-4 font-bold">Coordinates</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bots.map((bot, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={bot.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{bot.id}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={bot.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <div
                                                    className={`h-full rounded-full ${bot.battery < 30 ? 'bg-rose-500' : bot.battery < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${bot.battery}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-mono text-xs text-slate-500">{bot.battery}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{bot.task}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{bot.location}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">CONFIGURE</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                    <button className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">Load More Units</button>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const styles = {
        active: "bg-emerald-50 text-emerald-700 border-emerald-100",
        maintenance: "bg-amber-50 text-amber-700 border-amber-100",
        critical: "bg-rose-50 text-rose-700 border-rose-100"
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${styles[status] || styles.active}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : status === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
            {status}
        </span>
    )
}
