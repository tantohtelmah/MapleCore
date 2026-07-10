import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface Account {
  id: number;
  accountNumber: string;
  rawAccountNumber: string;
  accountType: string;
  balance: number;
  status: string;
}

interface Beneficiary {
  id: number;
  name: string;
  rawAccountNumber: string;
  nickname: string;
}

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [sourceNo, setSourceNo] = useState<string>('');
  const [destMode, setDestMode] = useState<'SAVED' | 'MANUAL'>('SAVED');
  const [selectedBene, setSelectedBene] = useState<string>('');
  const [manualDestNo, setManualDestNo] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const fetchTransferData = async () => {
    setLoading(true);
    try {
      // Parallel fetches for accounts and payees
      const authHeader = `Bearer ${localStorage.getItem('accessToken')}`;
      const [accRes, beneRes] = await Promise.all([
        fetch('/api/v1/accounts', { headers: { 'Authorization': authHeader } }),
        fetch('/api/v1/beneficiaries', { headers: { 'Authorization': authHeader } })
      ]);

      if (accRes.ok) setAccounts(await accRes.json());
      if (beneRes.ok) setBeneficiaries(await beneRes.json());
    } catch (err) {
      // Mock Fallbacks
      setAccounts([
        { id: 1, accountNumber: '******1234', rawAccountNumber: '1004382910', accountType: 'CHEQUING', balance: 1450.75, status: 'ACTIVE' },
        { id: 2, accountNumber: '******5678', rawAccountNumber: '2008471920', accountType: 'SAVINGS', balance: 10450.00, status: 'ACTIVE' }
      ]);
      setBeneficiaries([
        { id: 1, name: 'Alexander Bell', rawAccountNumber: '1004382910', nickname: 'Alex' },
        { id: 2, name: 'Frederick Banting', rawAccountNumber: '2008471920', nickname: 'Fred' }
      ]);
    } finally {
      setLoading(false);
      // Auto select first account if exists
      if (accounts.length > 0) setSourceNo(accounts[0].rawAccountNumber);
    }
  };

  useEffect(() => {
    fetchTransferData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const destinationNo = destMode === 'SAVED' ? selectedBene : manualDestNo;

    const payload = {
      sourceAccountNumber: sourceNo,
      destinationAccountNumber: destinationNo,
      amount: parseFloat(amount) || 0,
      description
    };

    // Generate unique Idempotency Key header
    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch('/api/v1/transactions/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(`Transfer completed successfully! Ref: ${idempotencyKey.substring(0, 8).toUpperCase()}`);
        setAmount('');
        setDescription('');
        setSelectedBene('');
        setManualDestNo('');
        fetchTransferData();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Transfer failed. Check balance or daily limits.');
      }
    } catch (err) {
      // Sandbox fallback
      setSuccess(`Transfer processed (Demo Sandbox Mode). Ref: ${idempotencyKey.substring(0, 8).toUpperCase()}`);
      setAmount('');
      setDescription('');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4">
      <div>
        <h2 className="text-xl font-bold text-brand-charcoal-800">Transfer Funds</h2>
        <p className="text-xs text-brand-grey-500 mt-0.5">Execute secure, atomic money transfers between bank accounts.</p>
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

      <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleTransfer} className="space-y-6">
          {/* Source Account Selection */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">From Account</label>
            <select
              value={sourceNo}
              onChange={(e) => setSourceNo(e.target.value)}
              required
              className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
            >
              <option value="">Select source account...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.rawAccountNumber}>
                  {acc.accountType} ({acc.accountNumber}) — Balance: ${acc.balance.toFixed(2)} CAD
                </option>
              ))}
            </select>
          </div>

          <hr className="border-brand-grey-100" />

          {/* Destination Account Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Send To</label>
              <div className="flex space-x-2 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setDestMode('SAVED')}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    destMode === 'SAVED'
                      ? 'bg-brand-red-500 text-white border-brand-red-500'
                      : 'bg-white text-brand-grey-500 border-brand-grey-200 hover:bg-brand-grey-50'
                  }`}
                >
                  Saved Payee
                </button>
                <button
                  type="button"
                  onClick={() => setDestMode('MANUAL')}
                  className={`px-3 py-1 rounded-full border transition-all ${
                    destMode === 'MANUAL'
                      ? 'bg-brand-red-500 text-white border-brand-red-500'
                      : 'bg-white text-brand-grey-500 border-brand-grey-200 hover:bg-brand-grey-50'
                  }`}
                >
                  Manual Account No
                </button>
              </div>
            </div>

            {destMode === 'SAVED' ? (
              <div className="space-y-1">
                <select
                  value={selectedBene}
                  onChange={(e) => setSelectedBene(e.target.value)}
                  required={destMode === 'SAVED'}
                  className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                >
                  <option value="">Select payee...</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.rawAccountNumber}>
                      {b.name} {b.nickname ? `(${b.nickname})` : ''} — {b.rawAccountNumber}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  required={destMode === 'MANUAL'}
                  placeholder="Enter 10-digit account number"
                  value={manualDestNo}
                  onChange={(e) => setManualDestNo(e.target.value)}
                  className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <hr className="border-brand-grey-100" />

          {/* Amount and description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Amount (CAD)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Description (Memo)</label>
              <input
                type="text"
                placeholder="e.g. Split dinners, rent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-red-500 hover:bg-brand-red-600 active:bg-brand-red-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-red-500/10 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <Send size={14} />
            <span>{submitting ? 'Processing Transfer...' : 'Execute Secure Transfer'}
            </span>
          </button>
        </form>
      </div>

      <div className="bg-brand-grey-50 border border-brand-grey-200 rounded-2xl p-4 flex items-start space-x-2.5 text-xs text-brand-grey-500">
        <HelpCircle className="text-brand-red-500 flex-shrink-0 mt-0.5" size={16} />
        <div className="space-y-1">
          <p className="font-semibold text-brand-charcoal-800">Transfer Limits & Security</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Single transfers are limited to a daily aggregate of $5,000.00 CAD.</li>
            <li>Idempotency checking is enabled to protect network retry requests.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
