import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ReceiptText,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  ArrowLeft,
  CreditCard,
  Wallet 
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { mockTransactions, mockWallet } from '@/data/clubMocks';


const fmtAmount = (n, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);

export function Transactions() {
  const [transactions, setTransactions] = useState(mockTransactions);

  // Simulation temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      const random = mockTransactions[
        Math.floor(Math.random() * mockTransactions.length)
      ];

      const newTransaction = {
        ...random,
        id: Date.now().toString()
      };

      setTransactions((prev) => [newTransaction, ...prev].slice(0, 20));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const totalIn = transactions
    .filter((t) => t.direction === 'in')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalOut = transactions
    .filter((t) => t.direction === 'out')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="relative py-12">
      <Container>
        <Link
            to="/clubs"
            className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-50 "
          >
            <ArrowLeft size={16} />
            Retour au club
          </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-emerald-400/10 border border-emerald-400/20">
            <ReceiptText
              className="text-emerald-400"
              size={34}
            />
          </div>

          <div>
            <h1 className="font-display text-4xl font-black text-bone-50 uppercase">
              Transactions
            </h1>

            <p className="text-bone-400">
              Historique des opérations en temps réel
            </p>
          </div>
        </div>


        <Container className="relative pt-12 md:pt-16 pb-6">
            <WalletSection wallet={mockWallet} />
        </Container>

        {/* Stats */}

        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <GlassCard className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-bone-400">
              Entrées
            </p>

            <div className="mt-3 flex items-center gap-3">
              <ArrowDownLeft
                className="text-emerald-400"
                size={24}
              />

              <span className="font-display text-4xl font-black text-emerald-400">
                +{totalIn.toFixed(2)} PCC
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-bone-400">
              Sorties
            </p>

            <div className="mt-3 flex items-center gap-3">
              <ArrowUpRight
                className="text-red-400"
                size={24}
              />

              <span className="font-display text-4xl font-black text-red-400">
                -{totalOut.toFixed(2)} PCC
              </span>
            </div>
          </GlassCard>

        </div>

        {/* Actions */}

        <div className="flex flex-wrap gap-3 mb-8">

          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10">
            <Search size={16} />
            Rechercher
          </button>

          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10">
            <Filter size={16} />
            Filtrer
          </button>

        </div>

        {/* Liste */}

        <div className="space-y-4">

          <AnimatePresence>

            {transactions.map((transaction) => (

              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: -30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard className="p-5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                        className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-2xl"
                      >
                        {transaction.icon}
                      </motion.div>

                      <div>
                        <h3 className="font-bold text-bone-50">
                          {transaction.label}
                        </h3>

                        <p className="text-sm text-bone-400">
                          {transaction.sub}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`font-display text-2xl font-black ${
                        transaction.direction === 'in'
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transaction.direction === 'in'
                        ? '+'
                        : '-'}
                      {Math.abs(transaction.amount).toFixed(2)} PCC
                    </div>

                  </div>

                </GlassCard>
              </motion.div>
            ))}

          </AnimatePresence>

        </div>

      </Container>
    </div>
  );
}

function WalletSection({ wallet}) {
  return (
    <div className="grid gap-3 md:gap-4 md:grid-cols-2">
      <WalletCard
        icon={<CreditCard size={18} />}
        accentColor="#10b981"
        label={wallet.bank.label}
        amount={fmtAmount(wallet.bank.balance, wallet.bank.currency)}
        sub={wallet.bank.note}
      />
      <WalletCard
        icon={<Wallet size={18} />}
        accentColor="#a78bfa"
        label={wallet.crypto.label}
        amount={fmtAmount(wallet.crypto.balance, 'EUR')}
        sub={`${wallet.crypto.currency} · ${wallet.crypto.address}`}
      />
    </div>
  );
}

function WalletCard({ icon, accentColor, label, amount, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 md:p-6 overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30" style={{ background: accentColor }} />

      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl ring-1"
          style={{ color: accentColor, background: `${accentColor}1A`, borderColor: `${accentColor}40` }}
        >
          {icon}
        </div>
        <div className="text-sm font-semibold text-bone-200">{label}</div>
      </div>

      <div className="mt-4 font-display text-3xl md:text-4xl font-black text-bone-50 tabular-nums">
        {amount}
      </div>
      <div className="mt-1 text-xs text-bone-400 font-mono">{sub}</div>
    </motion.div>
  );
}