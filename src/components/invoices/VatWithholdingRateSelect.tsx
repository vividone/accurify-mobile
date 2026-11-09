import { useState } from 'react';
import { VAT_WITHHOLDING_OPTIONS } from '@/utils/invoice-totals';

const FULL = 'full';
const CUSTOM = 'custom';

interface VatWithholdingRateSelectProps {
  /** Share of the subtotal withheld as VAT; null = the full VAT */
  value: number | null | undefined;
  onChange: (rate: number | null) => void;
}

const isPreset = (value: number | null | undefined) =>
  value == null || VAT_WITHHOLDING_OPTIONS.some((option) => option.value === value);

const fieldClass =
  'w-full h-12 px-4 bg-gray-10 border border-gray-30 text-body-01 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg';

/** How much VAT a withholding client keeps: the full VAT, a common share, or any % of the subtotal. */
export function VatWithholdingRateSelect({ value, onChange }: VatWithholdingRateSelectProps) {
  // Custom stays selected while the user types, even if they land on a preset value
  const [customChosen, setCustomChosen] = useState(false);
  const custom = customChosen || !isPreset(value);

  return (
    <div className="space-y-2">
      <select
        aria-label="Amount of VAT withheld"
        value={custom ? CUSTOM : value == null ? FULL : String(value)}
        onChange={(e) => {
          if (e.target.value === CUSTOM) {
            setCustomChosen(true);
            return;
          }
          setCustomChosen(false);
          onChange(e.target.value === FULL ? null : parseFloat(e.target.value));
        }}
        className={fieldClass}
      >
        {VAT_WITHHOLDING_OPTIONS.map((option) => (
          <option key={option.label} value={option.value == null ? FULL : String(option.value)}>
            {option.label}
          </option>
        ))}
        <option value={CUSTOM}>Other % of subtotal</option>
      </select>
      {custom && (
        <div className="flex items-center gap-2">
          <input
            aria-label="VAT withheld, % of subtotal"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.01}
            placeholder="e.g. 3.75"
            value={value != null ? String(parseFloat((value * 100).toFixed(4))) : ''}
            onChange={(e) => {
              const pct = parseFloat(e.target.value);
              onChange(isNaN(pct) ? null : Math.min(100, Math.max(0, pct)) / 100);
            }}
            className={fieldClass}
          />
          <span className="text-body-01 text-gray-50 whitespace-nowrap">% of subtotal</span>
        </div>
      )}
    </div>
  );
}
