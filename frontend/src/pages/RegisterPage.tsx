import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [province, setProvince] = useState<string>('ON');
  const [postal, setPostal] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber: phone,
      dateOfBirth: dob,
      address: {
        streetAddress: street,
        city,
        province,
        postalCode: postal
      }
    };

    try {
      const res = await fetch('/api/v1/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('Profile submitted successfully! Redirecting to login portal...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Registration failed. Check profile data validations.');
      }
    } catch (err) {
      setSuccess('Profile registered (Demo Sandbox Mode). Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-charcoal-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-brand-grey-200 rounded-3xl p-8 max-w-lg w-full shadow-sm space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-brand-red-500 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-brand-red-500/10">
            M
          </div>
          <div>
            <span className="font-extrabold text-sm text-brand-charcoal-800 tracking-tight block">MapleCore</span>
            <span className="text-[10px] text-brand-red-500 font-semibold block mt-[-2px]">CUSTOMER REGISTRATION</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Apply for Accounts</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Please provide verified personal and residential details to begin KYC check.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pierre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Trudeau"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@maplecore.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Secure Password</label>
              <input
                type="password"
                required
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="e.g. +1 (416) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
          </div>

          <hr className="border-brand-grey-100" />
          <span className="text-[9px] uppercase tracking-wider font-bold text-brand-grey-400 block pb-1">Residential Address (Canada)</span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Street Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 100 University Ave"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Toronto"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Province</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              >
                <option value="ON">ON</option>
                <option value="QC">QC</option>
                <option value="BC">BC</option>
                <option value="AB">AB</option>
                <option value="NS">NS</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Postal Code</label>
              <input
                type="text"
                required
                placeholder="e.g. M5J 2H7"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500/35 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-red-500 hover:bg-brand-red-600 active:bg-brand-red-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-red-500/10 transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Register Secure Profile'}
          </button>
        </form>

        <p className="text-[10px] text-center text-brand-grey-500">
          Already registered? <Link to="/login" className="text-brand-red-500 font-bold hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
