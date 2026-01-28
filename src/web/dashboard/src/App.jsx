import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Shield, Zap, Skull, Play, Square, RotateCcw, Syringe, Bot } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function App() {
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
          time: new Date().toLocaleTimeString(),
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
    const interval = setInterval(fetchData, 100);
    return () => clearInterval(interval);
  }, []);

  const sendControl = async (action) => {
    await fetch(`${API_URL}/control/${action}`, { method: 'POST' });
  };

  const spawn = async (type) => {
    await fetch(`${API_URL}/spawn/${type}`, { method: 'POST' });
  };

  if (loading) return <div className="text-primary flex items-center justify-center h-screen">CONNECTING TO NANO-NET...</div>;

  return (
    <div className="min-h-screen bg-background text-white p-6 font-mono">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-primary/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Activity className="w-6 h-6" />
            NANO-DIAGNOSTICS <span className="text-xs bg-primary/20 px-2 py-1 rounded">V2.0.4</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time Cellular Repair Monitor</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface rounded border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${data.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm">{data.running ? 'SYSTEM ONLINE' : 'STANDBY'}</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Shield} title="HEALTH INTEGRITY" value={`${Math.round((data.healthy / data.total_cells) * 100)}%`} color="text-green-500" />
        <StatCard icon={Skull} title="THREAT LEVEL" value={data.cancer} color="text-secondary" sub="Active Cancer Cells" />
        <StatCard icon={Zap} title="BOT EFFICIENCY" value={`${data.efficiency}%`} color="text-primary" />
        <StatCard icon={Bot} title="ACTIVE FLEET" value={data.active_bots} color="text-blue-400" sub={`Total: ${data.total_bots}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Chart */}
        <div className="lg:col-span-2 bg-surface p-4 rounded-lg border border-gray-800">
          <h2 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
            <Activity className="w-4 h-4" /> CELL POPULATION TRENDS
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" tick={false} />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#02040a', border: '1px solid #00f2ff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="healthy" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cancer" stroke="#ff003c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-surface p-4 rounded-lg border border-gray-800 flex flex-col gap-4">
          <h2 className="text-lg font-bold mb-2 text-primary">MISSION CONTROL</h2>

          <div className="grid grid-cols-3 gap-2">
            <ControlButton onClick={() => sendControl('start')} icon={Play} label="START" color="bg-green-600 hover:bg-green-500" />
            <ControlButton onClick={() => sendControl('stop')} icon={Square} label="STOP" color="bg-red-600 hover:bg-red-500" />
            <ControlButton onClick={() => sendControl('reset')} icon={RotateCcw} label="RESET" color="bg-gray-600 hover:bg-gray-500" />
          </div>

          <div className="border-t border-gray-700 my-2"></div>

          <h3 className="text-sm text-gray-400">INJECTIONS</h3>
          <button onClick={() => spawn('cancer')} className="w-full py-3 bg-secondary/20 border border-secondary text-secondary hover:bg-secondary/30 rounded flex items-center justify-center gap-2 transition-all">
            <Skull size={18} /> INJECT PATHOGEN
          </button>

          <button onClick={() => spawn('bot')} className="w-full py-3 bg-primary/20 border border-primary text-primary hover:bg-primary/30 rounded flex items-center justify-center gap-2 transition-all">
            <Syringe size={18} /> DEPLOY NANO-BOT
          </button>

          <div className="mt-auto bg-black/50 p-3 rounded border border-gray-700 text-xs text-gray-500 font-mono">
            &gt; Connection established.<br />
            &gt; Awaiting inputs.<br />
            &gt; Latency: 12ms
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, color, sub }) {
  return (
    <div className="bg-surface p-4 rounded-lg border border-gray-800">
      <div className="flex justify-between items-start">
        <div className={color}>
          <Icon className="w-6 h-6 mb-2" />
        </div>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
      <h3 className="text-xs text-gray-400 font-bold">{title}</h3>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  )
}

function ControlButton({ onClick, icon: Icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`${color} flex flex-col items-center justify-center p-3 rounded transition-colors text-white`}
    >
      <Icon size={20} className="mb-1" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  )
}

export default App
