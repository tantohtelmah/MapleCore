import { useState, useEffect } from 'react';
import { CreditCard, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface Account {
  id: number;
  accountNumber: string;
  rawAccountNumber: string;
  accountType: string;
  balance: number;
  status: 'PENDING' | 'ACTIVE' | 'FROZEN' | 'DORMANT' | 'CLOSED';
  currency: string;
  createdDate: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<'CHEQUING' | 'SAVINGS' | 'BUSINESS'>('CHEQUING');
  const [initialDeposit, setInitialDeposit] = useState<string>('0.00');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        // Fallback mock accounts
        setAccounts([
          {
            id: 1,
            accountNumber: '******1234',
            rawAccountNumber: '1004382910',
            accountType: 'CHEQUING',
            balance: 1450.75,
            status: 'ACTIVE',
            currency: 'CAD',
            createdDate: new Date().toISOString()
          },
          {
            id: 2,
            accountNumber: '******5678',
            rawAccountNumber: '2008471920',
            accountType: 'SAVINGS',
            balance: 10450.00,
            status: 'ACTIVE',
            currency: 'CAD',
            createdDate: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setAccounts([
        {
          id: 1,
          accountNumber: '******1234',
          rawAccountNumber: '1004382910',
          accountType: 'CHEQUING',
          balance: 1450.75,
          status: 'ACTIVE',
          currency: 'CAD',
          createdDate: new Date().toISOString()
        },
        {
          id: 2,
          accountNumber: '******5678',
          rawAccountNumber: '2008471920',
          accountType: 'SAVINGS',
          balance: 10450.00,
          status: 'ACTIVE',
          currency: 'CAD',
          createdDate: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      accountType,
      initialDeposit: parseFloat(initialDeposit) || 0
    };

    try {
      const res = await fetch('/api/v1/accounts/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('Account application submitted successfully. Pending Bank Employee approval.');
        setShowApplyModal(false);
        fetchAccounts();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to submit application.');
      }
    } catch (err) {
      // Mock Success locally
      setSuccess('Account application submitted (Demo Sandbox Mode).');
      setShowApplyModal(false);
      setAccounts(prev => [
        ...prev,
        {
          id: prev.length + 1,
          accountNumber: '******9999',
          rawAccountNumber: 'PENDING-APP',
          accountType,
          balance: parseFloat(initialDeposit) || 0,
          status: 'PENDING',
          currency: 'CAD',
          createdDate: new Date().toISOString()
        }
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-brand-grey-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Your Bank Accounts</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Manage balances and apply for core banking deposits.</p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center space-x-1.5 bg-brand-red-500 hover:bg-brand-red-600 active:bg-brand-red-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-colors shadow-md shadow-brand-red-500/10"
        >
          <PlusCircle size={16} />
          <span>Open New Account</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2.5 rounded-xl flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-2.5 rounded-xl flex items-center space-x-2">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-grey-100 text-brand-grey-500 rounded-full">
            <CreditCard size={24} />
          </div>
          <h4 className="font-bold text-brand-charcoal-800">No Active Accounts</h4>
          <p className="text-xs text-brand-grey-500 max-w-sm mx-auto">
            You do not have any registered accounts yet. Click 'Open New Account' above to request checking, savings, or business accounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((acc) => (
            <div 
              key={acc.id}
              className="bg-white border border-brand-grey-200 hover:border-brand-grey-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] bg-brand-charcoal-50 text-brand-charcoal-800 border border-brand-grey-200 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                    {acc.accountType}
                  </span>
                  <h4 className="font-bold text-sm text-brand-charcoal-800 font-mono mt-2">
                    {acc.accountNumber}
                  </h4>
                  <p className="text-[10px] text-brand-grey-500">
                    Opened: {new Date(acc.createdDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  acc.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : acc.status === 'PENDING'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {acc.status}
                </span>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-brand-grey-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-brand-grey-500 tracking-wider">Available Balance</span>
                  <div className="text-2xl font-bold text-brand-charcoal-800 tracking-tight flex items-baseline">
                    {formatCurrency(acc.balance)}
                    <span className="text-xs text-brand-grey-500 font-medium ml-1">{acc.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-brand-grey-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-5 animate-slide-up">
            <div>
              <h3 className="font-bold text-lg text-brand-charcoal-800">Apply for Account</h3>
              <p className="text-xs text-brand-grey-500 mt-1">Submit application details for core deposit services.</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                >
                  <option value="CHEQUING">Chequing Account</option>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="BUSINESS">Business Account</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Initial Deposit (CAD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-1/2 py-2 border border-brand-grey-300 text-brand-charcoal-800 hover:bg-brand-grey-50 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2 bg-brand-red-500 hover:bg-brand-red-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
