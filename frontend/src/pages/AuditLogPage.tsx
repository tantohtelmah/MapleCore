import { useState, useEffect } from 'react';
import { Eye, Terminal, Info } from 'lucide-react';

interface AuditLog {
  id: number;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  status: string;
  ipAddress: string;
  correlationId: string;
  metadata: string;
  createdDate: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMeta, setSelectedMeta] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/audit-logs?page=${page}&size=15&sort=createdDate,desc`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.content);
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
    setLogs([
      {
        id: 1,
        actor: 'compliance@maplecore.ca',
        action: 'VERIFY_CUSTOMER_KYC',
        resourceType: 'CUSTOMER',
        resourceId: '101',
        status: 'SUCCESS',
        ipAddress: '192.168.1.50',
        correlationId: 'c1234567-89ab-cdef-0123-456789abcdef',
        metadata: '{"reviewer":"compliance@maplecore.ca","decision":"VERIFIED","notes":"Identity matches public PR files."}',
        createdDate: new Date().toISOString()
      },
      {
        id: 2,
        actor: 'customer@maplecore.ca',
        action: 'TRANSFER_INITIATION',
        resourceType: 'TRANSACTION',
        resourceId: 'TX-FLAG',
        status: 'SUCCESS',
        ipAddress: '192.168.1.100',
        correlationId: 'd7654321-89ab-cdef-0123-456789abcdef',
        metadata: '{"source":"1001111111","dest":"2002222222","amount":15000.00,"flagged":true}',
        createdDate: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-brand-grey-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">System Audit Logs</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Immutable recording of administrative, authentication, and financial operations.</p>
        </div>
        <span className="flex items-center space-x-1.5 text-xs bg-brand-charcoal-50 border border-brand-grey-200 text-brand-charcoal-800 px-3 py-1 rounded-full font-semibold">
          <Terminal size={14} />
          <span>Console Auditor</span>
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-brand-grey-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-grey-50 border-b border-brand-grey-200 text-brand-grey-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-center">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-grey-100 font-medium text-brand-charcoal-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-grey-50/50">
                  <td className="py-3 px-4 text-brand-grey-500 font-mono whitespace-nowrap">
                    {new Date(log.createdDate).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{log.actor}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[11px]">{log.action}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-brand-charcoal-50 text-brand-charcoal-800 px-2 py-0.5 rounded border border-brand-grey-200">
                      {log.resourceType}: {log.resourceId}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-grey-500">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedMeta(log.metadata)}
                      className="p-1 text-brand-grey-400 hover:text-brand-red-500 hover:bg-brand-red-50 rounded transition-all"
                      title="Inspect Metadata"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-1.5 border border-brand-grey-300 text-xs font-semibold rounded-lg hover:bg-brand-grey-50 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-brand-grey-500 font-medium">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-1.5 border border-brand-grey-300 text-xs font-semibold rounded-lg hover:bg-brand-grey-50 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {/* Metadata Inspector Modal */}
      {selectedMeta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-brand-grey-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-slide-up">
            <div className="flex items-center space-x-2 text-brand-charcoal-800 font-bold text-sm">
              <Info size={18} className="text-brand-red-500" />
              <span>Inspect Audit Metadata</span>
            </div>
            <pre className="bg-brand-grey-50 border border-brand-grey-200 rounded-xl p-4 text-xs font-mono text-brand-charcoal-800 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(JSON.parse(selectedMeta), null, 2)}
            </pre>
            <button
              onClick={() => setSelectedMeta(null)}
              className="w-full py-2 bg-brand-charcoal-900 hover:bg-brand-charcoal-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
