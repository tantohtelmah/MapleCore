import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, FileText, User } from 'lucide-react';
interface PendingKyc {
  customerId: number;
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  submittedAt: string;
}

export default function KycReviewPage() {
  const [submissions, setSubmissions] = useState<PendingKyc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingKyc = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/fraud-alerts/pending-kyc', { // We can adjust routing later
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        // Fallback mock submissions
        setSubmissions([
          {
            customerId: 101,
            fullName: 'Pierre Trudeau',
            email: 'customer@maplecore.ca',
            documentType: 'PASSPORT',
            documentNumber: 'AA123456',
            submittedAt: new Date().toISOString()
          },
          {
            customerId: 102,
            fullName: 'Celine Dion',
            email: 'celine@maplecore.ca',
            documentType: 'DRIVERS_LICENSE',
            documentNumber: 'DL987654321',
            submittedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setSubmissions([
        {
          customerId: 101,
          fullName: 'Pierre Trudeau',
          email: 'customer@maplecore.ca',
          documentType: 'PASSPORT',
          documentNumber: 'AA123456',
          submittedAt: new Date().toISOString()
        },
        {
          customerId: 102,
          fullName: 'Celine Dion',
          email: 'celine@maplecore.ca',
          documentType: 'DRIVERS_LICENSE',
          documentNumber: 'DL987654321',
          submittedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const handleReview = async (customerId: number, status: 'VERIFIED' | 'REJECTED') => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/customers/${customerId}/kyc/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (res.ok) {
        // Remove reviewed item
        setSubmissions(submissions.filter(sub => sub.customerId !== customerId));
        setReviewing(null);
        setNotes('');
      } else {
        setError('Failed to submit review.');
      }
    } catch (err) {
      // Sandbox mode mock success
      setSubmissions(submissions.filter(sub => sub.customerId !== customerId));
      setReviewing(null);
      setNotes('');
    } finally {
      setProcessing(false);
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
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
      <div className="flex justify-between items-center border-b border-brand-grey-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Compliance Operations</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Review and verify fictional customer identity (KYC) submissions.</p>
        </div>
        <span className="text-xs bg-brand-red-50 border border-brand-red-100 text-brand-red-600 px-3 py-1 rounded-full font-medium">
          KYC Portal
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-green-500 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="font-bold text-brand-charcoal-800">All Caught Up!</h4>
          <p className="text-xs text-brand-grey-500 max-w-sm mx-auto">There are currently no customer KYC submissions pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-2 space-y-4">
            {submissions.map((sub) => (
              <div 
                key={sub.customerId}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer ${
                  reviewing === sub.customerId ? 'border-brand-red-500 ring-1 ring-brand-red-500' : 'border-brand-grey-200 hover:border-brand-grey-300'
                }`}
                onClick={() => {
                  setReviewing(sub.customerId);
                  setNotes('');
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-brand-charcoal-50 rounded-xl flex items-center justify-center text-brand-charcoal-800">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-charcoal-800">{sub.fullName}</h4>
                      <p className="text-[11px] text-brand-grey-500 mt-0.5">{sub.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-red-600 bg-brand-red-50 px-2 py-0.5 rounded border border-brand-red-100 uppercase tracking-wide">
                    {sub.documentType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-xs p-3 bg-brand-grey-50 rounded-xl border border-brand-grey-100">
                  <div>
                    <span className="text-brand-grey-500 block">Document ID</span>
                    <span className="font-mono font-medium text-brand-charcoal-800 mt-0.5 block">{sub.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-brand-grey-500 block">Submitted At</span>
                    <span className="text-brand-charcoal-800 font-medium mt-0.5 block">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Review Details panel */}
          <div className="lg:col-span-1">
            {reviewing ? (
              <div className="bg-white border border-brand-grey-200 rounded-2xl p-6 shadow-sm space-y-5 sticky top-6">
                <div className="flex items-center space-x-2 text-brand-charcoal-800 font-bold text-sm">
                  <FileText size={18} className="text-brand-red-500" />
                  <span>Evaluate Application</span>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-2.5 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="text-xs space-y-2.5 p-3 bg-brand-grey-50 rounded-xl border border-brand-grey-200">
                  <div className="flex justify-between">
                    <span className="text-brand-grey-500">Applicant:</span>
                    <span className="font-semibold text-brand-charcoal-800">
                      {submissions.find(s => s.customerId === reviewing)?.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-grey-500">Doc Reference:</span>
                    <span className="font-mono text-brand-charcoal-800">
                      {submissions.find(s => s.customerId === reviewing)?.documentNumber}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-grey-500">Notes / Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Enter verification notes or rejection reasons..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-brand-grey-50 border border-brand-grey-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-red-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleReview(reviewing, 'REJECTED')}
                    disabled={processing}
                    className="flex items-center justify-center space-x-1 border border-brand-red-500 text-brand-red-500 hover:bg-brand-red-50 font-bold text-xs py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleReview(reviewing, 'VERIFIED')}
                    disabled={processing}
                    className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-brand-grey-50 border border-brand-grey-200 border-dashed rounded-2xl p-8 text-center text-xs text-brand-grey-500">
                Select a pending KYC submission from the list to evaluate details and perform review.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
