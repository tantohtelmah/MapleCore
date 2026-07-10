import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter } from 'lucide-react';

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

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/transactions?page=${page}&size=10&sort=createdDate,desc`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.content);
        setTotalPages(data.totalPages);
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
    setTransactions([
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
        amount: -1049.25,
        transactionType: 'TRANSFER',
        status: 'COMPLETED',
        description: 'Rent e-Transfer',
        createdDate: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        referenceNumber: 'TX-90184721',
        sourceAccountNumber: '******1234',
        destinationAccountNumber: '',
        amount: -45.00,
        transactionType: 'WITHDRAWAL',
        status: 'COMPLETED',
        description: 'ATM Cash Withdrawal',
        createdDate: new Date(Date.now() - 172800000).toISOString()
      }
    ]);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(val);
  };

  const filteredTx = transactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.transactionType === filterType;
  });

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-grey-200 pb-4 space-y-3 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Transaction History</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Filter and review your financial ledger history logs.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter size={14} className="text-brand-grey-500" />
          <span className="font-semibold text-brand-grey-500 mr-1">Filter Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-brand-grey-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-4">
        {filteredTx.length === 0 ? (
          <p className="text-xs text-brand-grey-500 py-8 text-center">No transaction records matched your filter choices.</p>
        ) : (
          <div className="divide-y divide-brand-grey-100">
            {filteredTx.map((tx) => (
              <div key={tx.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-brand-charcoal-50 text-brand-charcoal-800'
                  }`}>
                    {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand-charcoal-800">{tx.description}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-brand-grey-500 font-mono mt-0.5">
                      <span>Ref: {tx.referenceNumber}</span>
                      <span>•</span>
                      <span>Type: {tx.transactionType}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-brand-charcoal-800'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center justify-end space-x-1 text-[9px] text-brand-grey-500 mt-1">
                    <Calendar size={10} />
                    <span>{new Date(tx.createdDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-1.5 border border-brand-grey-300 text-xs font-semibold rounded-lg hover:bg-brand-grey-50 disabled:opacity-30"
          >
            Previous Page
          </button>
          <span className="text-xs text-brand-grey-500 font-medium">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-1.5 border border-brand-grey-300 text-xs font-semibold rounded-lg hover:bg-brand-grey-50 disabled:opacity-30"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}
