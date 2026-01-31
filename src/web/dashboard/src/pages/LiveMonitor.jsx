import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Activity, Maximize,
    ChevronLeft, ChevronRight, Microscope,
    AlertTriangle, CheckCircle, Crosshair,
    Wifi, ShieldCheck, Waves, Pause, Radio
} from 'lucide-react';
import NanoGrid3D from '../components/NanoGrid3D';

const API_URL = 'http://localhost:8001';

export default function LiveMonitor() {
    const [running, setRunning] = useState(false);
    const [stats, setStats] = useState({ healthy: 0, cancer: 0, bots: 0 });
    const [simData, setSimData] = useState({ agents: [] });
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [simSpeed, setSimSpeed] = useState(0.1);

    // UI State
    const [rightOpen, setRightOpen] = useState(true);

    useEffect(() => {
        let intervalId;
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/status`);
                const data = await res.json();
                setRunning(data.running);
                setStats({ healthy: data.healthy, cancer: data.cancer, bots: data.active_bots });
                setSimData(data);
                if (selectedAgent) {
                    const updated = data.agents.find(a => a.id === selectedAgent.id);
                    if (updated) setSelectedAgent(updated);
                }
            } catch (err) { }
        };
        fetchData();
        intervalId = setInterval(fetchData, 100);
        return () => clearInterval(intervalId);
    }, [selectedAgent]);

    const handleCommand = async (command) => {
        if (!selectedAgent) return;
        await fetch(`${API_URL}/control/bot/${selectedAgent.id}/command?command=${command}`, { method: 'POST' });
    };

    const handleSpeed = async (e) => {
        const speed = parseFloat(e.target.value);
        setSimSpeed(speed);
        await fetch(`${API_URL}/control/config?speed=${speed}`, { method: 'POST' });
    };

    return (
        <div className="h-full w-full bg-slate-50 flex overflow-hidden text-slate-800 font-sans">

            {/* MAIN VIEWPORT */}
            <div className="flex-1 flex flex-col relative bg-slate-100">
                {/* Top Toolbar */}
                <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-3 shadow-sm z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Activity size={16} className="text-emerald-600" /> Live Simulation Feed
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold border tracking-wider ${running ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            {running ? <Radio size={12} className="animate-pulse" /> : <Pause size={12} />}
                            {running ? "LIVE FEED ACTIVE" : "SIMULATION PAUSED"}
                        </div>
                    </div>

                    <button onClick={() => setRightOpen(!rightOpen)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500">
                        {rightOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* 3D Canvas */}
                <div className="flex-1 relative overflow-hidden bg-slate-200/50">
                    <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-slate-400">Initializing Core...</div>}>
                        <NanoGrid3D data={simData} onSelect={setSelectedAgent} selectedId={selectedAgent?.id} />
                    </Suspense>

                    {/* Floating HUD */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-lg w-64">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-xs text-slate-500 uppercase font-bold">Active Units</div>
                                <div className="text-3xl font-mono font-bold text-sky-600 leading-none">{stats.bots}</div>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR - Inspector & Controls */}
            <motion.div
                animate={{ width: rightOpen ? 320 : 0, opacity: rightOpen ? 1 : 0 }}
                className="bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col"
            >
                <div className="p-4 border-b border-slate-100 font-bold text-slate-700 flex items-center gap-2 bg-slate-50/50 text-sm">
                    <Microscope size={16} className="text-indigo-600" /> ANALYSIS DECK
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    {/* Network Status */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded flex flex-col items-center">
                            <Wifi size={14} className="text-emerald-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-600">SIGNAL: STRONG</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-2 rounded flex flex-col items-center">
                            <ShieldCheck size={14} className="text-sky-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-600">FIREWALL: ON</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Contextual Inspector */}
                    <AnimatePresence mode="wait">
                        {selectedAgent ? (
                            <motion.div
                                key={selectedAgent.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
                            >
                                <div className="bg-slate-800 p-3 flex justify-between items-center text-white">
                                    <div className="font-mono text-lg font-bold">#{selectedAgent.id}</div>
                                    <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">{selectedAgent.type}</div>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs text-slate-500">Status</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedAgent.state === 'LOW_BATTERY' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>{selectedAgent.state}</span>
                                    </div>

                                    {selectedAgent.battery !== undefined && (
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-500 flex items-center gap-1"><Zap size={12} /> Fuel Cell</span>
                                                <span className="font-mono">{Math.round(selectedAgent.battery)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                                <div className={`h-full ${selectedAgent.battery < 30 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${selectedAgent.battery}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedAgent.type === 'bot' && (
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <button
                                                onClick={() => handleCommand('RECALL')}
                                                className="bg-rose-50 border border-rose-200 text-rose-700 py-3 rounded-md text-[10px] font-bold hover:bg-rose-100 transition-colors flex flex-col items-center gap-1"
                                            >
                                                <AlertTriangle size={14} /> RECALL UNIT
                                            </button>
                                            <button
                                                onClick={() => handleCommand('RELEASE')}
                                                className="bg-slate-50 border border-slate-200 text-slate-700 py-3 rounded-md text-[10px] font-bold hover:bg-slate-100 transition-colors flex flex-col items-center gap-1"
                                            >
                                                <CheckCircle size={14} /> RELEASE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="h-48 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50"
                            >
                                <Crosshair size={32} className="mb-2 opacity-50" />
                                <span className="text-xs font-medium">AWAITING TARGET SELECTION</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Simulation Controls */}
                    <div className="border-t border-slate-100 pt-6">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Waves size={12} /> Temporal Control
                        </label>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                <div className="flex justify-between text-xs mb-3">
                                    <span className="text-slate-600 font-bold">Simulation Speed</span>
                                    <span className="text-indigo-600 font-mono font-bold">{simSpeed}x</span>
                                </div>
                                <input
                                    type="range" min="0.01" max="0.5" step="0.01"
                                    value={simSpeed} onChange={handleSpeed}
                                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">
                                    <span>Realtime</span>
                                    <span>Slow Motion</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
