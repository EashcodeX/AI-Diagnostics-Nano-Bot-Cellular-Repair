import { Users, Battery, Radio } from 'lucide-react';

export default function Fleet() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Fleet Management</h1>
                <p className="text-sm text-slate-500">Detailed status of deployed Nano-Bots.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Unit ID</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold">Battery</th>
                                <th className="px-6 py-3 font-semibold">Target</th>
                                <th className="px-6 py-3 font-semibold">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-mono text-slate-700">NB-{100 + i}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            Online
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Battery size={14} className="text-slate-400" />
                                            <span className="font-mono">9{i}%</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500" style={{ width: `9${i}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">Scanning Sector {i}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">[{i * 5}, {10 + i}, {i * 2}]</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
