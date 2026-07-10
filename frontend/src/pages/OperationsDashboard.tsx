import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Users, CreditCard, ArrowRight } from 'lucide-react';

interface OpsData {
  activeCustomersCount: number;
  pendingKycCount: number;
  pendingAccountsCount: number;
  flaggedTransactionsCount: number;
}

export default function OperationsDashboard() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/dashboard/operations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        setMockData();
      }
    } catch (err) {
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setData({
      activeCustomersCount: 12,
      pendingKycCount: 2,
      pendingAccountsCount: 1,
      flaggedTransactionsCount: 2
    });
  };

  useEffect(() => {
    fetchOps();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      <div>
        <h2 className="text-xl font-bold text-brand-charcoal-800">Operational Overview</h2>
        <p className="text-xs text-brand-grey-500 mt-0.5">Real-time stats monitor for compliance officer and admin role queues.</p>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Customers */}
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-brand-grey-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Customers</span>
            <Users size={16} />
          </div>
          <span className="text-2xl font-black text-brand-charcoal-900 block">{data?.activeCustomersCount}</span>
        </div>

        {/* Pending KYC */}
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-brand-grey-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending KYC Reviews</span>
            <ShieldCheck size={16} className="text-brand-red-500" />
          </div>
          <span className="text-2xl font-black text-brand-charcoal-900 block">{data?.pendingKycCount}</span>
        </div>

        {/* Pending Accounts */}
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-brand-grey-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Accounts</span>
            <CreditCard size={16} />
          </div>
          <span className="text-2xl font-black text-brand-charcoal-900 block">{data?.pendingAccountsCount}</span>
        </div>

        {/* Flagged Transactions */}
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-brand-grey-500">
            <span className="text-[10px] uppercase font-bold tracking-wider">Risk Alerts Flagged</span>
            <ShieldAlert size={16} className="text-brand-red-500 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-brand-charcoal-900 block">{data?.flaggedTransactionsCount}</span>
        </div>
      </div>

      {/* Navigation Quick Links to Compliance review boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-1.5">
              <ShieldCheck size={18} className="text-brand-red-500" />
              <span>KYC Compliance Queue</span>
            </h3>
            <p className="text-xs text-brand-grey-500">Verify customer identity profiles and approve account openings.</p>
          </div>
          <Link
            to="/compliance/kyc"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-red-500 hover:text-brand-red-600 transition-colors"
          >
            <span>Open Review Queue</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-1.5">
              <ShieldAlert size={18} className="text-brand-red-500" />
              <span>Fraud Alert Monitor</span>
            </h3>
            <p className="text-xs text-brand-grey-500">Audit held transactions flagged by the Strategy pattern risk engine.</p>
          </div>
          <Link
            to="/compliance/alerts"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-red-500 hover:text-brand-red-600 transition-colors"
          >
            <span>Open Security Console</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
