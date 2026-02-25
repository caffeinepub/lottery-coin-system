import React, { useRef, useEffect } from "react";

interface NumberPickerProps {
  value: string;
  onChange: (value: string) => void;
  digitCount?: number;
  disabled?: boolean;
}

export default function NumberPicker({
  value,
  onChange,
  digitCount = 6,
  disabled = false,
}: NumberPickerProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, digitCount);
  }, [digitCount]);

  const digits = Array.from({ length: digitCount }, (_, i) => value[i] || "");

  const handleChange = (index: number, char: string) => {
    if (!/^\d$/.test(char)) return;
    const newDigits = [...digits];
    newDigits[index] = char;
    onChange(newDigits.join(""));
    if (index < digitCount - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        onChange(newDigits.join(""));
      } else if (index > 0) {
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < digitCount - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digitCount);
    const newDigits = Array.from({ length: digitCount }, (_, i) => pasted[i] || "");
    onChange(newDigits.join(""));
    const nextEmpty = pasted.length < digitCount ? pasted.length : digitCount - 1;
    inputRefs.current[nextEmpty]?.focus();
  };

  // Group digits for visual separation
  const getGroupSize = () => {
    if (digitCount === 6) return 3;
    if (digitCount === 9) return 3;
    if (digitCount === 12) return 4;
    return 3;
  };

  const groupSize = getGroupSize();

  return (
    <div
      className="flex flex-wrap gap-2 justify-center"
      role="group"
      aria-label={`${digitCount}-digit number picker`}
    >
      {digits.map((digit, index) => (
        <React.Fragment key={index}>
          {index > 0 && index % groupSize === 0 && (
            <span className="flex items-center text-muted-foreground font-bold text-lg">-</span>
          )}
          <input
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${digitCount}`}
            className={`
              w-10 h-12 text-center text-xl font-bold rounded-lg border-2 
              bg-background text-foreground
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              ${digit ? "border-primary bg-primary/10" : "border-border"}
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text hover:border-primary/60"}
            `}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
