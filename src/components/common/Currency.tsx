import React from 'react';

interface CurrencyProps {
  amount: number; // in integer paise
  className?: string;
  prefix?: string;
  showDecimals?: boolean;
}

export const paiseToRupees = (paise: number): number => {
  return (paise || 0) / 100;
};

export const rupeesToPaise = (rupees: number): number => {
  return Math.round((rupees || 0) * 100);
};

/**
 * Formats integer paise into Indian Rupee representation (e.g. 184250000 paise -> ₹18,42,500)
 */
export const formatINR = (val: number, showDecimals = false): string => {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  const isNegative = val < 0;
  const absPaise = Math.abs(val);
  const rupees = absPaise / 100;

  // Format with standard Indian numbering format (e.g. 18,42,500)
  const hasDecimalPaise = absPaise % 100 !== 0;
  const needDecimals = showDecimals || hasDecimalPaise;
  const parts = rupees.toFixed(needDecimals ? 2 : 0).split('.');
  
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedWhole = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const formatted = needDecimals && parts[1] ? `${formattedWhole}.${parts[1]}` : formattedWhole;

  return `${isNegative ? '-' : ''}₹${formatted}`;
};

/**
 * Formats a rupee value directly into Indian Rupee representation
 */
export const formatRupees = (rupees: number, showDecimals = false): string => {
  return formatINR(rupeesToPaise(rupees), showDecimals);
};

export const Currency: React.FC<CurrencyProps> = ({
  amount,
  className = '',
  prefix = '',
  showDecimals = false,
}) => {
  return (
    <span className={`tabular-nums font-medium ${className}`}>
      {prefix}
      {formatINR(amount, showDecimals)}
    </span>
  );
};
