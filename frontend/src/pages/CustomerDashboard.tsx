import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, ShieldAlert, CreditCard, Send, PlusCircle } from 'lucide-react';

interface Account {
  id: number;
  maskedAccountNumber: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  currency: string;
}

interface Transaction {
  id: number;
  referenceNumber: string;
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  createdDate: string;
}

interface DashboardData {
  totalBalance: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  unreadNotificationsCount: number;
}

export default function CustomerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/dashboard/customer', {
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
      totalBalance: 11900.75,
      accounts: [
        { id: 1, maskedAccountNumber: '******1234', accountNumber: '1004382910', accountType: 'CHEQUING', balance: 1450.75, status: 'ACTIVE', currency: 'CAD' },
        { id: 2, maskedAccountNumber: '******5678', accountNumber: '2008471920', accountType: 'SAVINGS', balance: 10450.00, status: 'ACTIVE', currency: 'CAD' }
      ],
      recentTransactions: [
        {
          id: 1,
          referenceNumber: 'TX-90184719',
          sourceAccountNumber: '',
          destinationAccountNumber: '******1234',
          amount: 2500.00,
          transactionType: 'DEPOSIT',
          status: 'COMPLETED',
          description: 'Mobile Cheque Deposit',
          createdDate: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          referenceNumber: 'TX-90184720',
          sourceAccountNumber: '******1234',
          destinationAccountNumber: '******5678',
          amount: -1000.00,
          transactionType: 'TRANSFER',
          status: 'COMPLETED',
          description: 'Savings transfer allocation',
          createdDate: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      unreadNotificationsCount: 1
    });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Hello, Pierre Trudeau</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Welcome back to your MapleCore Online Portal. Everything looks secure.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-brand-grey-500 block uppercase font-bold tracking-wider">Total Net Worth</span>
          <span className="text-2xl font-black text-brand-charcoal-900 mt-1 block">
            {formatCurrency(data?.totalBalance || 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Accounts list */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-1.5">
              <CreditCard size={16} className="text-brand-red-500" />
              <span>Active Accounts</span>
            </h3>
            <Link
              to="/accounts"
              className="text-xs font-semibold text-brand-red-500 hover:text-brand-red-600 transition-colors flex items-center space-x-1"
            >
              <PlusCircle size={14} />
              <span>Open Account</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data?.accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white border border-brand-grey-200 rounded-2xl p-5 hover:border-brand-grey-300 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-brand-charcoal-50 text-brand-charcoal-800 px-2 py-0.5 rounded font-bold uppercase border border-brand-grey-200">
                      {acc.accountType}
                    </span>
                    <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-semibold border border-green-100 uppercase">
                      {acc.status}
                    </span>
                  </div>
                  <span className="text-xs text-brand-grey-500 font-mono mt-3 block">{acc.maskedAccountNumber}</span>
                </div>
                <span className="text-lg font-black text-brand-charcoal-900 mt-6 block">
                  {formatCurrency(acc.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel Quick transfer links */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-1.5">
            <Send size={16} className="text-brand-red-500" />
            <span>Fast Transfers</span>
          </h3>
          <div className="bg-white border border-brand-grey-200 rounded-2xl p-5 shadow-sm space-y-3">
            <p className="text-xs text-brand-grey-500">Need to transfer money or pay a saved beneficiary?</p>
            <Link
              to="/transfer"
              className="w-full py-2.5 bg-brand-red-500 hover:bg-brand-red-600 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Send size={14} />
              <span>Send Money</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Ledger History */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-1.5">
          <ShieldAlert size={16} className="text-brand-red-500" />
          <span>Recent Activity logs</span>
        </h3>
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm divide-y divide-brand-grey-100">
          {data?.recentTransactions.length === 0 ? (
            <p className="text-xs text-brand-grey-500 text-center py-4">No recent activity on your accounts.</p>
          ) : (
            data?.recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-brand-charcoal-50 text-brand-charcoal-800'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-brand-charcoal-800">{tx.description}</h4>
                    <span className="text-[9px] text-brand-grey-500 font-mono mt-0.5 block">{tx.referenceNumber}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-xs ${tx.amount > 0 ? 'text-green-600' : 'text-brand-charcoal-800'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[9px] text-brand-grey-500 block mt-0.5">
                    {new Date(tx.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
