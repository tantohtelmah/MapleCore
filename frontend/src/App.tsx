import { useState, useEffect } from 'react';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [dbStatus, setDbStatus] = useState<string>('Unknown');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/actuator/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(data.status || 'UP');
        setDbStatus(data.components?.db?.status || 'Mock/None');
      } else {
        setHealthStatus('DOWN (Non-200 Response)');
      }
    } catch (error) {
      setHealthStatus('DOWN (Connection Refused)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen justify-between bg-brand-grey-100">
      <header className="bg-white border-b border-brand-grey-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🍁</span>
          <h1 className="text-xl font-bold text-brand-charcoal-800 tracking-tight">
            Maple<span className="text-brand-red-500">Core</span>
          </h1>
        </div>
        <span className="text-xs px-2.5 py-1 bg-brand-grey-200 text-brand-charcoal-800 rounded-full font-medium">
          Sandbox MVP
        </span>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white border border-brand-grey-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-red-50 text-brand-red-500 text-3xl mb-2">
            🍁
          </div>
          <h2 className="text-2xl font-bold text-brand-charcoal-800">
            MapleCore Banking
          </h2>
          <p className="text-sm text-brand-grey-500 max-w-sm mx-auto leading-relaxed">
            Secure core banking services demonstration. This environment uses fictional data. It is not a real financial institution.
          </p>

          <div className="p-4 bg-brand-grey-50 border border-brand-grey-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-grey-500 font-medium">Backend Status:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                healthStatus === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {loading ? 'Polling...' : healthStatus}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-brand-grey-500 font-medium">Database Status:</span>
              <span className="text-brand-charcoal-800 font-mono text-xs">
                {loading ? 'Polling...' : dbStatus}
              </span>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-red-500 hover:bg-brand-red-600 active:bg-brand-red-700 text-white font-semibold rounded-xl shadow-md shadow-brand-red-500/10 transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Verify System Health'}
          </button>
        </div>
      </main>

      <footer className="bg-brand-charcoal-900 text-brand-grey-300 py-6 px-6 text-center text-xs border-t border-brand-charcoal-800">
        <p>© 2026 MapleCore Banking Platform. All rights reserved.</p>
        <p className="mt-1 text-brand-grey-500">
          Built with React, Vite, Spring Boot, and PostgreSQL.
        </p>
      </footer>
    </div>
  );
}

export default App;
