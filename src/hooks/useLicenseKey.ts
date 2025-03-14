import { useLocalStorage } from "usehooks-ts";

export const useLicenseKey = () => {
  const [licenseKey, setLicenseKey] = useLocalStorage("licenseKey", "");
  const hasLicenseKey = !!licenseKey;
  return {
    licenseKey,
    hasLicenseKey,
    setLicenseKey,
  };
};
