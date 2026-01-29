import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Activity, Users, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">

            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shrink-0 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white shadow-sm ring-2 ring-sky-100">
                        <Activity size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-800">NanoHealth</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
                    <NavItem to="/monitor" icon={Activity} label="Live Simulation" active={location.pathname === '/monitor'} />
                    <NavItem to="/fleet" icon={Users} label="Fleet Management" active={location.pathname === '/fleet'} />
                    <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs ring-2 ring-white">
                            DR
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">Dr. Eash</div>
                            <div className="text-xs text-slate-500 truncate">Lead Researcher</div>
                        </div>
                        <LogOut size={14} className="text-slate-400" />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <main className="flex-1 ml-64 p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
                <Outlet />
            </main>
        </div>
    );
}

function NavItem({ to, icon: Icon, label, active }) {
    return (
        <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${active ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'}`}>
            <Icon size={18} className={`transition-colors ${active ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {label}
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500"></div>}
        </Link>
    )
}
