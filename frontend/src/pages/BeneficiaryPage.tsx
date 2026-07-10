import { useState, useEffect } from 'react';
import { User, PlusCircle, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
interface Beneficiary {
  id: number;
  name: string;
  accountNumber: string; // masked
  rawAccountNumber: string;
  nickname: string;
}

export default function BeneficiaryPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/beneficiaries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBeneficiaries(data);
      } else {
        // Fallback mock payees
        setMockData();
      }
    } catch (err) {
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setBeneficiaries([
      {
        id: 1,
        name: 'Alexander Graham Bell',
        accountNumber: '******8291',
        rawAccountNumber: '1004382910',
        nickname: 'Alex'
      },
      {
        id: 2,
        name: 'Frederick Banting',
        accountNumber: '******1920',
        rawAccountNumber: '2008471920',
        nickname: 'Fred'
      }
    ]);
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setSuccess(null);

    const payload = { name, accountNumber, nickname };

    try {
      const res = await fetch('/api/v1/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('Beneficiary added successfully.');
        setName('');
        setAccountNumber('');
        setNickname('');
        setShowAddForm(false);
        fetchBeneficiaries();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to add beneficiary.');
      }
    } catch (err) {
      // Mock local add
      setSuccess('Beneficiary added (Demo Sandbox Mode).');
      setBeneficiaries(prev => [
        ...prev,
        {
          id: prev.length + 1,
          name,
          accountNumber: '******' + accountNumber.substring(accountNumber.length - 4),
          rawAccountNumber: accountNumber,
          nickname
        }
      ]);
      setName('');
      setAccountNumber('');
      setNickname('');
      setShowAddForm(false);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/v1/beneficiaries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        setSuccess('Beneficiary removed successfully.');
        setBeneficiaries(beneficiaries.filter(b => b.id !== id));
      } else {
        setError('Failed to delete beneficiary.');
      }
    } catch (err) {
      setSuccess('Beneficiary removed (Demo Sandbox Mode).');
      setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-brand-grey-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Saved Payees</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Register and manage beneficiaries for fast bank transfers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-brand-red-500 hover:bg-brand-red-600 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-colors shadow-md shadow-brand-red-500/10"
        >
          <PlusCircle size={16} />
          <span>Add New Payee</span>
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

      {showAddForm && (
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-4 animate-slide-up">
          <h3 className="font-bold text-sm text-brand-charcoal-800">Register Payee</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alexander Bell"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Account Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 1004382910"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Nickname (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2 px-4 border border-brand-grey-300 text-brand-charcoal-800 text-xs font-semibold rounded-xl hover:bg-brand-grey-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="py-2 px-6 bg-brand-red-500 hover:bg-brand-red-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {adding ? 'Registering...' : 'Save Payee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {beneficiaries.length === 0 ? (
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-grey-100 text-brand-grey-500 rounded-full">
            <User size={24} />
          </div>
          <h4 className="font-bold text-brand-charcoal-800">No Saved Payees</h4>
          <p className="text-xs text-brand-grey-500 max-w-sm mx-auto">
            You do not have any registered beneficiaries yet. Click 'Add New Payee' above to save accounts for quick money transfers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beneficiaries.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-brand-grey-200 hover:border-brand-grey-300 rounded-2xl p-5 shadow-sm flex justify-between items-center transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-charcoal-50 rounded-xl flex items-center justify-center text-brand-charcoal-800">
                  <User size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-2">
                    <span>{b.name}</span>
                    {b.nickname && (
                      <span className="text-[10px] bg-brand-grey-100 border border-brand-grey-200 text-brand-grey-500 px-1.5 py-0.5 rounded font-normal">
                        {b.nickname}
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-brand-grey-500 font-mono mt-0.5 block">{b.accountNumber}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 text-brand-grey-500 hover:text-brand-red-500 hover:bg-brand-red-50 rounded-lg transition-all"
                title="Remove Payee"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
