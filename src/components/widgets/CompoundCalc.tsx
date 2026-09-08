import React, { useState, useMemo } from 'react';

function formatINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CompoundCalc() {
  const [monthlySip, setMonthlySip] = useState<number>(25000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(15);
  const [stepUpPercent, setStepUpPercent] = useState<number>(5);

  const { totalInvested, totalCorpus, wealthGained } = useMemo(() => {
    const months = timeHorizonYears * 12;
    const monthlyRate = expectedReturn / 100 / 12;
    let invested = 0;
    let corpus = 0;
    let currentMonthlySip = monthlySip;

    for (let m = 1; m <= months; m++) {
      if (m > 1 && (m - 1) % 12 === 0 && stepUpPercent > 0) {
        currentMonthlySip += currentMonthlySip * (stepUpPercent / 100);
      }
      invested += currentMonthlySip;
      corpus = (corpus + currentMonthlySip) * (1 + monthlyRate);
    }

    return {
      totalInvested: Math.round(invested),
      totalCorpus: Math.round(corpus),
      wealthGained: Math.round(corpus - invested),
    };
  }, [monthlySip, expectedReturn, timeHorizonYears, stepUpPercent]);

  return (
    <div className="not-prose my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 gap-2">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            SIP & Wealth Compounding Simulator
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Model real Indian compounding with annual SIP step-up
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
          Client Island Hydrated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Monthly SIP</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(monthlySip)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={monthlySip}
              onChange={(e) => setMonthlySip(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Expected Annual Return (CAGR)</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Time Horizon</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{timeHorizonYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={timeHorizonYears}
              onChange={(e) => setTimeHorizonYears(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Annual Step-up</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{stepUpPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={stepUpPercent}
              onChange={(e) => setStepUpPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                Total Estimated Corpus
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatINR(totalCorpus)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200/80 dark:border-zinc-700/80">
              <div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Invested</span>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {formatINR(totalInvested)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Estimated Gains</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +{formatINR(wealthGained)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-700/80 text-[11px] text-zinc-500 dark:text-zinc-400">
            Multiplier:{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">
              {(totalCorpus / (totalInvested || 1)).toFixed(1)}x
            </strong>{' '}
            of your principal over {timeHorizonYears} years.
          </div>
        </div>
      </div>
    </div>
  );
}
