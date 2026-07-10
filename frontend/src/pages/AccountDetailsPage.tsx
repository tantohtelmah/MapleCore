import { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Transaction {
  id: number;
  referenceNumber: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'BILL_PAYMENT' | 'REVERSAL';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED' | 'FLAGGED';
  createdDate: string;
  description: string;
}

interface AccountDetails {
  id: number;
  accountNumber: string;
  rawAccountNumber: string;
  accountType: string;
  balance: number;
  status: 'PENDING' | 'ACTIVE' | 'FROZEN' | 'DORMANT' | 'CLOSED';
  currency: string;
  createdDate: string;
}

export default function AccountDetailsPage({ accountId }: { accountId: number }) {
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
        // In real app, fetch transactions. Let's seed mock transactions for now.
        setTransactions([
          {
            id: 1,
            referenceNumber: 'TX-90184719',
            transactionType: 'DEPOSIT',
            amount: 2500.00,
            status: 'COMPLETED',
            createdDate: new Date(Date.now() - 86400000).toISOString(),
            description: 'Mobile Cheque Deposit'
          },
          {
            id: 2,
            referenceNumber: 'TX-90184720',
            transactionType: 'TRANSFER',
            amount: -1049.25,
            status: 'COMPLETED',
            createdDate: new Date(Date.now() - 172800000).toISOString(),
            description: 'Transfer to Beneficiary John'
          }
        ]);
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
    setAccount({
      id: accountId,
      accountNumber: '******1234',
      rawAccountNumber: '1004382910',
      accountType: 'CHEQUING',
      balance: 1450.75,
      status: 'ACTIVE',
      currency: 'CAD',
      createdDate: new Date(Date.now() - 30 * 86400000).toISOString()
    });
    setTransactions([
      {
        id: 1,
        referenceNumber: 'TX-90184719',
        transactionType: 'DEPOSIT',
        amount: 2500.00,
        status: 'COMPLETED',
        createdDate: new Date(Date.now() - 86400000).toISOString(),
        description: 'Mobile Cheque Deposit'
      },
      {
        id: 2,
        referenceNumber: 'TX-90184720',
        transactionType: 'TRANSFER',
        amount: -1049.25,
        status: 'COMPLETED',
        createdDate: new Date(Date.now() - 172800000).toISOString(),
        description: 'Transfer to Beneficiary John'
      }
    ]);
  };

  useEffect(() => {
    fetchDetails();
  }, [accountId]);

  const handleStatusChange = async (action: 'freeze' | 'unfreeze' | 'close') => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/accounts/${accountId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      } else {
        setError(`Failed to perform ${action} operation.`);
      }
    } catch (err) {
      // Mock action locally
      if (account) {
        const updatedStatus = action === 'freeze' ? 'FROZEN' : action === 'unfreeze' ? 'ACTIVE' : 'CLOSED';
        setAccount({ ...account, status: updatedStatus as any });
      }
    } finally {
      setProcessing(false);
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

  if (!account) {
    return (
      <div className="text-center py-12 text-brand-grey-500">
        Account details not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* Back button */}
      <button className="flex items-center space-x-1.5 text-xs text-brand-grey-500 hover:text-brand-charcoal-800 transition-colors">
        <ArrowLeft size={14} />
        <span>Back to Accounts</span>
      </button>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-brand-charcoal-50 text-brand-charcoal-800 border border-brand-grey-200 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
              {account.accountType}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              account.status === 'ACTIVE' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {account.status}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-brand-grey-500 tracking-wider">Account Number (Raw / Masked)</span>
            <h3 className="font-bold text-xl text-brand-charcoal-800 font-mono mt-0.5">
              {account.rawAccountNumber} <span className="text-brand-grey-500 text-sm">({account.accountNumber})</span>
            </h3>
          </div>
        </div>

        <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-brand-grey-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-end">
          <span className="text-[10px] uppercase font-semibold text-brand-grey-500 tracking-wider">Available Balance</span>
          <div className="text-3xl font-bold text-brand-charcoal-800 tracking-tight flex items-baseline mt-1">
            {formatCurrency(account.balance)}
            <span className="text-xs text-brand-grey-500 font-medium ml-1">{account.currency}</span>
          </div>
        </div>
      </div>

      {/* Admin Operations panel if role allows (represented here as general buttons) */}
      {account.status !== 'CLOSED' && (
        <div className="bg-brand-charcoal-900 border border-brand-charcoal-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 text-white shadow-md">
          <div className="flex items-center space-x-2 text-xs">
            <ShieldAlert className="text-brand-red-500" size={16} />
            <span className="font-medium">Employee Management Console (Sandbox)</span>
          </div>
          <div className="flex space-x-3">
            {account.status === 'ACTIVE' ? (
              <button
                onClick={() => handleStatusChange('freeze')}
                disabled={processing}
                className="bg-brand-red-600 hover:bg-brand-red-700 text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors"
              >
                Freeze Account
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('unfreeze')}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700 text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors"
              >
                Unfreeze Account
              </button>
            )}
            <button
              onClick={() => handleStatusChange('close')}
              disabled={processing || account.balance > 0}
              className="bg-transparent hover:bg-brand-charcoal-800 border border-brand-charcoal-700 text-xs font-semibold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-30"
              title={account.balance > 0 ? 'Balance must be 0.00 to close' : ''}
            >
              Close Account
            </button>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-brand-charcoal-800">Recent Transactions</h4>
        
        {transactions.length === 0 ? (
          <p className="text-xs text-brand-grey-500 py-4 text-center">No transactions recorded on this account yet.</p>
        ) : (
          <div className="divide-y divide-brand-grey-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-brand-charcoal-50 text-brand-charcoal-800'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-brand-charcoal-800">{tx.description}</h5>
                    <span className="text-[10px] text-brand-grey-500 font-mono mt-0.5 block">{tx.referenceNumber}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-brand-charcoal-800'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[9px] text-brand-grey-500 block mt-0.5">
                    {new Date(tx.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
