import { useState, useEffect } from 'react';
import { Bell, MailOpen, RefreshCw } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdDate: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
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
    setNotifications([
      {
        id: 1,
        title: 'Transfer Held for Review',
        message: 'Your transfer of $15,000.00 CAD was flagged by the rules engine and is currently pending review by our Compliance team.',
        read: false,
        createdDate: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Account Opening Approved',
        message: 'Congratulations! Your Savings account request was approved. Your account number is ******5678.',
        read: true,
        createdDate: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      // Mock locally
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
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
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-brand-grey-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal-800">Your Notifications</h2>
          <p className="text-xs text-brand-grey-500 mt-0.5">Stay informed on approvals, transactions, and security alerts.</p>
        </div>
        <button
          onClick={fetchNotifications}
          className="p-2 text-brand-grey-500 hover:text-brand-charcoal-800 hover:bg-brand-grey-50 rounded-xl transition-all"
          title="Refresh Alerts"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-grey-100 text-brand-grey-500 rounded-full">
            <Bell size={24} />
          </div>
          <h4 className="font-bold text-brand-charcoal-800">No New Notifications</h4>
          <p className="text-xs text-brand-grey-500 max-w-sm mx-auto">
            You do not have any alerts at the moment. System updates will appear here dynamically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`border rounded-2xl p-5 shadow-sm transition-all flex justify-between items-start ${
                n.read 
                  ? 'bg-white border-brand-grey-200 opacity-70' 
                  : 'bg-white border-brand-red-200 ring-1 ring-brand-red-500/10'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  n.read ? 'bg-brand-grey-100 text-brand-grey-500' : 'bg-brand-red-50 text-brand-red-500'
                }`}>
                  <Bell size={18} />
                </div>
                <div className="space-y-1 pr-6">
                  <h4 className="font-bold text-sm text-brand-charcoal-800 flex items-center space-x-2">
                    <span>{n.title}</span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 bg-brand-red-500 rounded-full"></span>
                    )}
                  </h4>
                  <p className="text-xs text-brand-grey-500 leading-relaxed max-w-xl">
                    {n.message}
                  </p>
                  <span className="text-[9px] text-brand-grey-400 block pt-1">
                    {new Date(n.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  className="flex-shrink-0 p-2 text-brand-grey-400 hover:text-brand-charcoal-800 hover:bg-brand-grey-50 rounded-lg transition-all"
                  title="Mark as Read"
                >
                  <MailOpen size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
