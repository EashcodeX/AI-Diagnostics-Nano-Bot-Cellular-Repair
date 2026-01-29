import { Save } from 'lucide-react';

export default function Settings() {
    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                <p className="text-sm text-slate-500">Configure simulation parameters.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">

                <div>
                    <h3 className="font-semibold text-slate-800 mb-4">Simulation Defaults</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Frame Rate</label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                                <option>30 FPS</option>
                                <option>60 FPS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Grid Size (Requires Reset)</label>
                            <input type="number" defaultValue={50} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700">
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>

            </div>
        </div>
    )
}
