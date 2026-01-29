import { useEffect, useState, Suspense } from 'react';
import { Play, Pause, AlertCircle, Maximize, Activity } from 'lucide-react';
import NanoGrid3D from '../components/NanoGrid3D';

const API_URL = 'http://localhost:8000';

export default function LiveMonitor() {
    const [running, setRunning] = useState(false);
    const [stats, setStats] = useState({ healthy: 0, cancer: 0, bots: 0 });
    const [simData, setSimData] = useState({ agents: [] });

    useEffect(() => {
        let intervalId;

        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/status`);
                const data = await res.json();

                setRunning(data.running);
                setStats({ healthy: data.healthy, cancer: data.cancer, bots: data.active_bots });
                setSimData(data); // Pass full data to 3D scene

            } catch (err) {
                // console.warn("Sim fetch error", err);
            }
        };

        fetchData(); // Initial
        intervalId = setInterval(fetchData, 100); // Poll 10Hz

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Live Simulation (3D)</h1>
                    <p className="text-sm text-slate-500">Real-time WebGL Visualization using React Three Fiber.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        {running ? (
                            <span className="flex items-center gap-2 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE FEED</span>
                        ) : (
                            <span className="flex items-center gap-2 text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-300"></span> STANDBY</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex gap-6">

                {/* Main Visualizer (3D) */}
                <div className="flex-1 min-h-[500px] bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center">
                    <Suspense fallback={<div className="text-white">Loading 3D Engine...</div>}>
                        <NanoGrid3D data={simData} />
                    </Suspense>

                    {!running && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                            <span className="text-xs font-bold text-white tracking-widest">SIMULATION PAUSED</span>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                <div className="w-80 flex flex-col gap-4">
                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-sky-600" /> Live Telemetry
                        </h3>
                        <div className="space-y-4">

                            <div className="relative pt-1">
                                <div className="flex mb-2 item-center justify-between">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100">
                                        Healthy Tissue
                                    </span>
                                    <span className="text-xs font-bold inline-block text-emerald-600">
                                        {stats.healthy}
                                    </span>
                                </div>
                            </div>

                            <div className="relative pt-1">
                                <div className="flex mb-2 item-center justify-between">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-rose-600 bg-rose-100">
                                        Pathogen Load
                                    </span>
                                    <span className="text-xs font-bold inline-block text-rose-600">
                                        {stats.cancer}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                    <div className="text-2xl font-bold text-sky-600">{stats.bots}</div>
                                    <div className="text-xs text-slate-500 font-medium">Active Bots</div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900">
                        <div className="flex items-start gap-3">
                            <Maximize size={20} className="mt-1" />
                            <div>
                                <h4 className="font-bold text-sm">Interactive 3D View</h4>
                                <p className="text-xs opacity-80 mt-1 leading-relaxed">
                                    • <strong>Left Click + Drag</strong> to Rotate<br />
                                    • <strong>Scroll</strong> to Zoom In/Out<br />
                                    • <strong>Right Click</strong> to Pan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
