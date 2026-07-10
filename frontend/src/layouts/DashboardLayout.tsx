import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  Send,
  User,
  Users,
  Bell,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  LogOut
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive(path)
        ? 'bg-brand-red-500 text-white shadow-md shadow-brand-red-500/10'
        : 'text-brand-grey-500 hover:text-brand-charcoal-800 hover:bg-brand-grey-50'
    }`;

  return (
    <div className="flex h-screen bg-brand-charcoal-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-grey-200 flex flex-col justify-between p-6">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="w-8 h-8 bg-brand-red-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-brand-red-500/10">
              M
            </div>
            <div>
              <span className="font-extrabold text-sm text-brand-charcoal-800 tracking-tight">MapleCore</span>
              <span className="text-[10px] text-brand-red-500 font-semibold block mt-[-2px]">BANKING PLATFORM</span>
            </div>
          </div>

          <hr className="border-brand-grey-100" />

          {/* Nav Links */}
          <nav className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-brand-grey-400 block px-2 pb-2">Main Menu</span>
            
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>

            {/* Customer Links */}
            {hasRole('ROLE_CUSTOMER') && (
              <>
                <Link to="/accounts" className={linkClass('/accounts')}>
                  <CreditCard size={16} />
                  <span>My Accounts</span>
                </Link>
                <Link to="/transfer" className={linkClass('/transfer')}>
                  <Send size={16} />
                  <span>Transfer Funds</span>
                </Link>
                <Link to="/beneficiaries" className={linkClass('/beneficiaries')}>
                  <Users size={16} />
                  <span>Saved Payees</span>
                </Link>
                <Link to="/profile" className={linkClass('/profile')}>
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
                <Link to="/notifications" className={linkClass('/notifications')}>
                  <Bell size={16} />
                  <span>Notifications</span>
                </Link>
              </>
            )}

            {/* Employee / Compliance Links */}
            {(hasRole('ROLE_BANK_EMPLOYEE') || hasRole('ROLE_COMPLIANCE_OFFICER')) && (
              <>
                <span className="text-[9px] uppercase tracking-wider font-bold text-brand-grey-400 block px-2 pt-4 pb-2">Compliance Portal</span>
                <Link to="/compliance/kyc" className={linkClass('/compliance/kyc')}>
                  <ShieldCheck size={16} />
                  <span>KYC Review Panel</span>
                </Link>
                <Link to="/compliance/alerts" className={linkClass('/compliance/alerts')}>
                  <ShieldAlert size={16} />
                  <span>Fraud Alert Console</span>
                </Link>
              </>
            )}

            {/* Admin Links */}
            {hasRole('ROLE_ADMIN') && (
              <>
                <span className="text-[9px] uppercase tracking-wider font-bold text-brand-grey-400 block px-2 pt-4 pb-2">Administration</span>
                <Link to="/admin/audit" className={linkClass('/admin/audit')}>
                  <Terminal size={16} />
                  <span>Audit Logs Console</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-4">
          <div className="bg-brand-grey-50 rounded-xl p-3 border border-brand-grey-200">
            <span className="text-[9px] text-brand-grey-400 font-semibold block uppercase">Active Profile</span>
            <span className="font-bold text-xs text-brand-charcoal-800 truncate block mt-0.5">{user?.email}</span>
            <span className="text-[10px] text-brand-red-500 font-semibold truncate block">
              {user?.roles.map(r => r.replace('ROLE_', '')).join(', ')}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-brand-charcoal-900 hover:bg-brand-charcoal-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Viewport Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header bar */}
        <header className="bg-white border-b border-brand-grey-200 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-brand-charcoal-800">Canadian Core Services Core</h1>
            <p className="text-[10px] text-brand-grey-400 font-medium mt-0.5">Secure Transaction Ledgers & Compliance Engines</p>
          </div>
          
          <div className="text-right text-[10px] text-brand-grey-400 bg-brand-grey-50 border border-brand-grey-200 px-3 py-1.5 rounded-lg max-w-md hidden md:block">
            <strong>Notice:</strong> MapleCore is a demonstration banking platform using fictional data. It is not a real financial institution.
          </div>
        </header>

        {/* Dynamic Outlet children */}
        <div className="flex-1 overflow-y-auto bg-brand-charcoal-50 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
