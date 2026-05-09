"use client";

import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PinInputHandle {
  focus: () => void;
}

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export const PinInput = forwardRef<PinInputHandle, PinInputProps>(({
  value,
  onChange,
  length = 6,
  onComplete,
  disabled = false,
  className,
  error = false,
}, ref) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRefs.current[0]?.focus();
    }
  }));

  // Ensure internal value array is consistent with prop value
  const values = value.split("").slice(0, length);
  const displayValues = [...values, ...Array(length - values.length).fill("")];

  const handleChange = (index: number, char: string) => {
    if (disabled) return;

    // Only allow numbers
    if (char && !/^\d+$/.test(char)) return;

    const newValues = [...displayValues];
    // Fast typing/overwrite: just take the last character
    const digit = char.slice(-1);
    newValues[index] = digit;
    
    const newValueString = newValues.join("").trim();
    onChange(newValueString);

    // Auto-advance
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check completion
    if (newValueString.length === length && onComplete) {
      onComplete(newValueString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      if (!displayValues[index] && index > 0) {
        // Move focus back and clear previous
        const newValues = [...displayValues];
        newValues[index - 1] = "";
        onChange(newValues.join("").trim());
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current
        const newValues = [...displayValues];
        newValues[index] = "";
        onChange(newValues.join("").trim());
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    
    onChange(pastedData);

    // Focus appropriate input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <div className={cn("flex justify-center gap-3", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={displayValues[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="one-time-code"
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold bg-muted/50 border-2 border-transparent rounded-xl transition-all outline-none",
            "focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive/50 bg-destructive/5"
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
});

PinInput.displayName = "PinInput";
