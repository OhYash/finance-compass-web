import React, { useState, useMemo } from 'react';

function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EpfTaxEstimator() {
  const [monthlyBasic, setMonthlyBasic] = useState<number>(120000);
  const [epfPercent, setEpfPercent] = useState<number>(12);
  const [vpfPercent, setVpfPercent] = useState<number>(0);
  const [taxSlabPercent, setTaxSlabPercent] = useState<number>(30);
  const epfInterestRate = 8.25; // EPFO statutory rate

  const {
    annualEmployeeContribution,
    isTaxable,
    taxableContribution,
    taxFreeContribution,
    totalAnnualInterest,
    taxableInterest,
    taxLiability,
    netPostTaxReturn,
  } = useMemo(() => {
    const totalMonthlyEmployee = (monthlyBasic * (epfPercent + vpfPercent)) / 100;
    const annualContrib = totalMonthlyEmployee * 12;

    const threshold = 250000;
    const taxablePart = Math.max(0, annualContrib - threshold);
    const taxFreePart = Math.min(annualContrib, threshold);

    // Approximate annual interest on the new year's contribution
    const totalInterest = (annualContrib * epfInterestRate) / 100 / 2; // mid-year average
    const taxInterest = (taxablePart * epfInterestRate) / 100 / 2;
    const taxOwed = (taxInterest * taxSlabPercent) / 100;

    const netInterest = totalInterest - taxOwed;
    const effectiveReturn = annualContrib > 0 ? (netInterest / annualContrib) * 100 * 2 : 0;

    return {
      annualEmployeeContribution: Math.round(annualContrib),
      isTaxable: taxablePart > 0,
      taxableContribution: Math.round(taxablePart),
      taxFreeContribution: Math.round(taxFreePart),
      totalAnnualInterest: Math.round(totalInterest),
      taxableInterest: Math.round(taxInterest),
      taxLiability: Math.round(taxOwed),
      netPostTaxReturn: effectiveReturn.toFixed(2),
    };
  }, [monthlyBasic, epfPercent, vpfPercent, taxSlabPercent]);

  return (
    <div className="not-prose my-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 gap-2">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            EPF Section 10(11)/(12) ₹2.5 Lakh Tax Threshold Calculator
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Evaluate whether your monthly PF + VPF crosses the non-taxable cap
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
          EPFO 8.25% Rule
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Monthly Basic + DA</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatINR(monthlyBasic)}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="400000"
              step="5000"
              value={monthlyBasic}
              onChange={(e) => setMonthlyBasic(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Mandatory EPF Contribution</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{epfPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="12"
              step="1"
              value={epfPercent}
              onChange={(e) => setEpfPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Voluntary PF (VPF) Additional %</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{vpfPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={vpfPercent}
              onChange={(e) => setVpfPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <span>Income Tax Marginal Slab</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">{taxSlabPercent}%</span>
            </div>
            <select
              value={taxSlabPercent}
              onChange={(e) => setTaxSlabPercent(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="0">0% (Below Exemption)</option>
              <option value="5">5% / 10% Low Slab</option>
              <option value="20">20% Mid Slab</option>
              <option value="30">30% (Standard Salaried Bracket)</option>
              <option value="39">39% (Highest Surcharge Bracket)</option>
            </select>
          </div>
        </div>

        {/* Results Card */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                Annual Employee Contribution
              </span>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {formatINR(annualEmployeeContribution)}
                <span className="text-xs font-normal text-zinc-500 ml-2">/ year</span>
              </div>
            </div>

            {isTaxable ? (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                ⚠️ <strong>Exceeds ₹2.5L limit!</strong> {formatINR(taxableContribution)} of your contribution will earn taxable interest.
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                ✓ <strong>100% Tax-Free!</strong> Entire contribution is below the annual ₹2.5L threshold.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Tax-Free Base</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{formatINR(taxFreeContribution)}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Gross Annual Interest</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{formatINR(totalAnnualInterest)}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Taxable Interest</span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{formatINR(taxableInterest)}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Estimated Tax Drag</span>
                <p className="font-semibold text-red-600 dark:text-red-400 mt-0.5">{formatINR(taxLiability)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200/80 dark:border-zinc-700/80 text-[11px] text-zinc-500 dark:text-zinc-400">
            Effective post-tax return:{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{netPostTaxReturn}%</strong> vs statutory {epfInterestRate}%.
          </div>
        </div>
      </div>
    </div>
  );
}
