import type { FC, FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Key, Loader, Eye, EyeOff } from "lucide-react";
import { useBoolean } from "usehooks-ts";

interface LicenseKeyInputProps {
  value?: string | null;
  isLoading?: boolean;
  fullWidth?: boolean;
  onSubmit: (value: string) => void;
}

export const LicenseKeyInput: FC<LicenseKeyInputProps> = ({
  value: valueProp,
  fullWidth,
  onSubmit,
  isLoading,
}) => {
  const {
    value: isReveal,
    setTrue: revealInput,
    setFalse: hideInput,
  } = useBoolean();

  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanText = value.trim();
    if (!cleanText) return;
    onSubmit(cleanText);
    setValue("");
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (valueProp) setValue(valueProp);
  }, [valueProp]);

  useEffect(() => {
    inputRef?.current?.focus();
  });

  return (
    <div className={!fullWidth ? "max-w-xl mx-auto" : ""}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="group flex items-center gap-4 bg-gray-800/50 rounded-lg px-6 focus-within:ring-2 focus-within:ring-blue-500 border border-gray-700">
          {isLoading ? (
            <Loader className="animate-spin" size={24} />
          ) : (
            <Key size={24} />
          )}

          <input
            ref={inputRef}
            type={isReveal ? "text" : "password"}
            value={value}
            disabled={isLoading}
            placeholder={
              isLoading ? "Checking..." : "Enter License Key [press \u23CE]"
            }
            className="w-full py-4 bg-transparent rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-transparent border-none"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeydown}
          />

          <button
            type="button"
            onClick={isReveal ? hideInput : revealInput}
            className="text-gray-400 hover:text-gray-200"
          >
            {isReveal ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
      </form>
    </div>
  );
};
