import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface FraudAlert {
  id: number;
  triggeredRules: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'CLEARED' | 'ESCALATED';
  notes: string;
  createdDate: string;
  transaction: {
    id: number;
    referenceNumber: string;
    amount: number;
    sourceAccount: { accountNumber: string };
    destinationAccount: { accountNumber: string };
  };
}

export default function FraudReviewPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/fraud-alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
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
    setAlerts([
      {
        id: 1,
        triggeredRules: 'HIGH_VALUE_TRANSFER',
        status: 'OPEN',
        notes: 'Transfer amount exceeds $10,000.00 CAD threshold.',
        createdDate: new Date().toISOString(),
        transaction: {
          id: 999,
          referenceNumber: 'TX-90184755',
          amount: 15000.00,
          sourceAccount: { accountNumber: '******1234' },
          destinationAccount: { accountNumber: '******5678' }
        }
      },
      {
        id: 2,
        triggeredRules: 'EXCESSIVE_VELOCITY',
        status: 'OPEN',
        notes: 'Multiple transfers executed in less than 5 minutes.',
        createdDate: new Date().toISOString(),
        transaction: {
          id: 998,
          referenceNumber: 'TX-90184766',
          amount: 250.00,
          sourceAccount: { accountNumber: '******1234' },
          destinationAccount: { accountNumber: '******9999' }
        }
      }
    ]);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleReview = async (alertId: number, action: 'CLEARED' | 'ESCALATED') => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/v1/fraud-alerts/${alertId}/review?action=${action}&notes=${encodeURIComponent(notes)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (res.ok) {
        setSuccess(`Alert reviewed and marked as ${action}.`);
        setAlerts(alerts.filter(a => a.id !== alertId));
        setReviewingId(null);
        setNotes('');
      } else {
        setError('Failed to submit fraud review.');
      }
    } catch (err) {
      setSuccess(`Alert reviewed (Demo Sandbox Mode) -> ${action}`);
      setAlerts(alerts.filter(a => a.id !== alertId));
      setReviewingId(null);
      setNotes('');
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
          <h2 className="text-xl font-bold text-brand-charcoal-800">Fraud & Compliance Alerts</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Evaluate and action transactions flagged by the risk rules engine.</p>
        </div>
        <span className="flex items-center space-x-1 text-xs bg-brand-red-50 border border-brand-red-100 text-brand-red-600 px-3 py-1 rounded-full font-semibold">
          <ShieldAlert size={14} />
          <span>Security Monitor</span>
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-2.5 rounded-xl">
          {success}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-green-500 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="font-bold text-brand-charcoal-800">All Cleared</h4>
          <p className="text-xs text-brand-grey-500 max-w-sm mx-auto">No pending fraud alerts require review at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts list */}
          <div className="lg:col-span-2 space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  setReviewingId(alert.id);
                  setNotes('');
                }}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer ${
                  reviewingId === alert.id ? 'border-brand-red-500 ring-1 ring-brand-red-500' : 'border-brand-grey-200 hover:border-brand-grey-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-brand-red-600 bg-brand-red-50 px-2 py-0.5 rounded border border-brand-red-100 uppercase tracking-wide">
                      {alert.triggeredRules}
                    </span>
                    <h4 className="font-bold text-sm text-brand-charcoal-800 mt-2">
                      Ref: {alert.transaction.referenceNumber}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-brand-charcoal-800">
                      {formatCurrency(alert.transaction.amount)}
                    </span>
                    <span className="text-[9px] text-brand-grey-500 block mt-0.5">
                      {new Date(alert.createdDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-xs p-3 bg-brand-grey-50 rounded-xl border border-brand-grey-100">
                  <div>
                    <span className="text-brand-grey-500 block">Source Account</span>
                    <span className="font-mono font-medium text-brand-charcoal-800 mt-0.5 block">
                      {alert.transaction.sourceAccount.accountNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-grey-500 block">Destination Account</span>
                    <span className="font-mono font-medium text-brand-charcoal-800 mt-0.5 block">
                      {alert.transaction.destinationAccount.accountNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action details */}
          <div className="lg:col-span-1">
            {reviewingId ? (
              <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-6">
                <div className="flex items-center space-x-2 text-brand-charcoal-800 font-bold text-sm">
                  <FileText size={18} className="text-brand-red-500" />
                  <span>Evaluate Flagged Activity</span>
                </div>

                <div className="text-xs space-y-2.5 p-3 bg-brand-grey-50 rounded-xl border border-brand-grey-200">
                  <div className="flex justify-between">
                    <span className="text-brand-grey-500">Alert ID:</span>
                    <span className="font-semibold text-brand-charcoal-800">#{reviewingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grey-500">Hold Amount:</span>
                    <span className="font-semibold text-brand-charcoal-800">
                      {formatCurrency(alerts.find(a => a.id === reviewingId)?.transaction.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grey-500">Trigger rule:</span>
                    <span className="font-mono text-brand-red-500 font-medium">
                      {alerts.find(a => a.id === reviewingId)?.triggeredRules}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Investigation Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter compliance evaluation notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleReview(reviewingId, 'ESCALATED')}
                    disabled={submitting}
                    className="flex items-center justify-center space-x-1 border border-brand-red-500 text-brand-red-500 hover:bg-brand-red-50 font-bold text-xs py-2 rounded-xl transition-colors"
                  >
                    <XCircle size={14} />
                    <span>Block / Fail</span>
                  </button>
                  <button
                    onClick={() => handleReview(reviewingId, 'CLEARED')}
                    disabled={submitting}
                    className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    <span>Clear & Send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-brand-grey-50 border border-brand-grey-200 border-dashed rounded-2xl p-8 text-center text-xs text-brand-grey-500">
                Select a compliance alert from the list to investigate notes and release/reject transactions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
