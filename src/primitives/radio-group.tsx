'use client';
import * as React from 'react';
import { cn } from './cn';

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  name: string;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export function RadioGroup({ value, onValueChange, name, children, className }: {
  value: string;
  onValueChange: (value: string) => void;
  name: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div role="radiogroup" className={cn('flex flex-col gap-2', className)}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({ value, id, className }: { value: string; id?: string; className?: string }) {
  const ctx = React.useContext(RadioGroupContext);
  if (!ctx) throw new Error('RadioGroupItem must be inside RadioGroup');
  return (
    <input
      type="radio"
      id={id}
      name={ctx.name}
      value={value}
      checked={ctx.value === value}
      onChange={() => ctx.onValueChange(value)}
      className={cn('h-4 w-4 border-input text-primary', className)}
    />
  );
}
