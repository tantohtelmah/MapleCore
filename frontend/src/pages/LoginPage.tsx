import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Key, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        login(data.accessToken, data.refreshToken, data.email, data.roles);
        navigate('/dashboard');
      } else {
        const errData = await res.json();
        setError(errData.message || 'Invalid username or password.');
      }
    } catch (err) {
      // Mock local fallback login for standalone preview mode
      mockLogin(email);
    } finally {
      setLoading(false);
    }
  };

  const mockLogin = (selectedEmail: string) => {
    let mockRoles = ['ROLE_CUSTOMER'];
    if (selectedEmail.includes('admin')) mockRoles = ['ROLE_ADMIN'];
    else if (selectedEmail.includes('compliance')) mockRoles = ['ROLE_COMPLIANCE_OFFICER'];
    else if (selectedEmail.includes('employee')) mockRoles = ['ROLE_BANK_EMPLOYEE'];

    login('mock-jwt-token', 'mock-refresh-token', selectedEmail, mockRoles);
    navigate('/dashboard');
  };

  const selectDemoUser = (userType: 'CUSTOMER' | 'EMPLOYEE' | 'COMPLIANCE' | 'ADMIN') => {
    if (userType === 'CUSTOMER') {
      setEmail('customer@maplecore.ca');
      setPassword('customerpassword123');
    } else if (userType === 'EMPLOYEE') {
      setEmail('employee@maplecore.ca');
      setPassword('employeepassword123');
    } else if (userType === 'COMPLIANCE') {
      setEmail('compliance@maplecore.ca');
      setPassword('compliancepassword123');
    } else if (userType === 'ADMIN') {
      setEmail('admin@maplecore.ca');
      setPassword('adminpassword123');
    }
  };

  return (
    <div className="min-h-screen bg-brand-charcoal-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-brand-grey-200 rounded-3xl p-8 max-w-md w-full shadow-sm space-y-6">
        {/* Title logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-brand-red-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-brand-red-500/10">
            M
          </div>
          <div>
            <span className="font-extrabold text-sm text-brand-charcoal-800 tracking-tight block">MapleCore</span>
            <span className="text-[10px] text-brand-red-500 font-semibold block mt-[-2px]">BANKING PORTAL</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Welcome Back</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Please sign in to access your secure core banking panel.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Corporate Email</label>
            <input
              type="email"
              required
              placeholder="name@maplecore.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Secure Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-red-500 hover:bg-brand-red-600 active:bg-brand-red-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <LogIn size={14} />
            <span>{loading ? 'Signing In...' : 'Verify & Enter Portal'}</span>
          </button>
        </form>

        <hr className="border-brand-grey-100" />

        {/* Demo select shortcut portal */}
        <div className="space-y-3">
          <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-grey-400 block text-center">Demo Quick-Select Roles</span>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <button
              onClick={() => selectDemoUser('CUSTOMER')}
              className="border border-brand-grey-200 hover:bg-brand-grey-50 p-2 rounded-xl text-brand-charcoal-800 transition-colors flex items-center space-x-1"
            >
              <Key size={12} className="text-brand-red-500" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => selectDemoUser('EMPLOYEE')}
              className="border border-brand-grey-200 hover:bg-brand-grey-50 p-2 rounded-xl text-brand-charcoal-800 transition-colors flex items-center space-x-1"
            >
              <Key size={12} className="text-brand-red-500" />
              <span>Employee</span>
            </button>
            <button
              onClick={() => selectDemoUser('COMPLIANCE')}
              className="border border-brand-grey-200 hover:bg-brand-grey-50 p-2 rounded-xl text-brand-charcoal-800 transition-colors flex items-center space-x-1"
            >
              <Key size={12} className="text-brand-red-500" />
              <span>Compliance</span>
            </button>
            <button
              onClick={() => selectDemoUser('ADMIN')}
              className="border border-brand-grey-200 hover:bg-brand-grey-50 p-2 rounded-xl text-brand-charcoal-800 transition-colors flex items-center space-x-1"
            >
              <Key size={12} className="text-brand-red-500" />
              <span>System Admin</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-brand-grey-500 mt-2">
          Don't have an account? <Link to="/register" className="text-brand-red-500 font-bold hover:underline">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
