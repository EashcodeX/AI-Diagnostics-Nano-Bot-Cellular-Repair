import { Save, Shield, Wifi, Server, Database, Lock, RefreshCw } from 'lucide-react';

export default function Settings() {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
                    <p className="text-sm text-slate-500">Manage global simulation parameters and security protocols.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Navigation Column */}
                <div className="space-y-2">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <LocalNavItem icon={Server} label="Simulation Engine" active />
                        <LocalNavItem icon={Wifi} label="Network Protocol" />
                        <LocalNavItem icon={Shield} label="Security" />
                        <LocalNavItem icon={Database} label="Data Retention" />
                    </div>
                    <div className="bg-indigo-900 p-4 rounded-xl text-white shadow-lg">
                        <div className="flex items-center gap-2 font-bold mb-2 text-indigo-200"><Lock size={16} /> Admin Access</div>
                        <p className="text-xs text-indigo-100 opacity-80 mb-4">You have root privileges. All changes will be logged to the immutable ledger.</p>
                        <button className="w-full py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-xs font-bold transition-colors">View Audit Log</button>
                    </div>
                </div>

                {/* Main Settings Panel */}
                <div className="md:col-span-2 space-y-6">

                    {/* Section 1 */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500"></div>
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Server size={18} className="text-slate-400" /> Simulation Parameters
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tick Rate (Hz)</label>
                                    <input type="number" defaultValue={60} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Entities</label>
                                    <input type="number" defaultValue={1000} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Environment</label>
                                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                        <option>Bloodstream (Viscose)</option>
                                        <option>Cellular Matrix</option>
                                        <option>Neural Tissue</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between pt-6">
                                    <span className="text-sm font-medium text-slate-700">Auto-Balancing</span>
                                    <Toggle active />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Wifi size={18} className="text-slate-400" /> Network & Telemetry
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Secure WebSocket</div>
                                    <div className="text-xs text-slate-500">Encrypt real-time data transmission</div>
                                </div>
                                <Toggle active />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Mesh Networking</div>
                                    <div className="text-xs text-slate-500">Allow agents to relay commands</div>
                                </div>
                                <Toggle />
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-rose-50 rounded-xl border border-rose-100 p-6">
                        <h3 className="font-bold text-rose-700 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} /> Danger Zone
                        </h3>
                        <p className="text-sm text-rose-600/80 mb-4">Irreversible actions for system administrators only.</p>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors flex items-center gap-2">
                                <RefreshCw size={14} /> Factory Reset
                            </button>
                            <button className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition-colors">
                                Purge All Data
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

function LocalNavItem({ icon: Icon, label, active }) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Icon size={16} /> {label}
        </button>
    )
}

function Toggle({ active }) {
    return (
        <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${active ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
    )
}
import { AlertTriangle } from 'lucide-react';
