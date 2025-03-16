import type { FC } from "react";
import { X } from "lucide-react";
import { LicenseKeyInput } from "./LicenseKeyInput";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseKey: string | null;
  onLicenseKeyChange: (key: string) => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  licenseKey,
  onLicenseKeyChange,
}) => {
  const handleChange = (value: string) => {
    onLicenseKeyChange(value);
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-screen-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="block text-lg font-semibold"
              htmlFor="license-key"
            >
              License Key
            </label>
            <LicenseKeyInput
              fullWidth
              value={licenseKey}
              onSubmit={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
