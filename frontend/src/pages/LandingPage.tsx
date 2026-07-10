import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, Database, Landmark } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-charcoal-900 text-white flex flex-col justify-between p-8 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-red-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-charcoal-800/50 blur-[120px] pointer-events-none" />

      {/* Top Header bar */}
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-brand-red-500 text-white rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md shadow-brand-red-500/10">
            M
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">MapleCore</span>
            <span className="text-[10px] text-brand-red-500 font-bold block mt-[-2px]">BANKING PLATFORM</span>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-bold border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-5 py-2 rounded-xl transition-all"
        >
          Sign In Portal
        </Link>
      </header>

      {/* Main hero block */}
      <main className="max-w-4xl mx-auto w-full text-center py-20 z-10 space-y-6">
        <span className="text-[10px] font-bold text-brand-red-500 bg-brand-red-500/10 border border-brand-red-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
          Enterprise Canadian Fintech Sandbox
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] max-w-2xl mx-auto">
          Secure Core Banking Services for Financial Innovation
        </h1>
        <p className="text-xs text-brand-grey-400 max-w-lg mx-auto leading-relaxed">
          MapleCore is a cloud-ready, domain-oriented banking services platform simulating real-time atomic ledgers, multi-rule risk engines, and strict audit tracks.
        </p>

        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 bg-brand-red-500 hover:bg-brand-red-600 active:bg-brand-red-700 text-white text-xs font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-brand-red-500/15"
          >
            <span>Enter Banking Portal</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Feature blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-16 text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <Landmark className="text-brand-red-500" size={20} />
            <h3 className="font-bold text-xs">Atomic Ledger</h3>
            <p className="text-[10px] text-brand-grey-400 leading-normal">ACID-compliant balance transactions using row-level write-locks.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <Cpu className="text-brand-red-500" size={20} />
            <h3 className="font-bold text-xs">Fraud Rules Engine</h3>
            <p className="text-[10px] text-brand-grey-400 leading-normal">Polymorphic strategy evaluations scanning values and speeds.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <Database className="text-brand-red-500" size={20} />
            <h3 className="font-bold text-xs">Immutable Audit</h3>
            <p className="text-[10px] text-brand-grey-400 leading-normal">Log records with correlation IDs tracking critical REST requests.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <ShieldCheck className="text-brand-red-500" size={20} />
            <h3 className="font-bold text-xs">KYC Workflows</h3>
            <p className="text-[10px] text-brand-grey-400 leading-normal">Compliance reviewer consoles tracking and checking identities.</p>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="max-w-6xl mx-auto w-full z-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-grey-500 pt-6 border-t border-white/5 space-y-2 md:space-y-0">
        <span>© {new Date().getFullYear()} MapleCore Banking Platform. Fictional demo environment.</span>
        <span>Built with Java 21, Spring Boot 3, PostgreSQL, & React.</span>
      </footer>
    </div>
  );
}
