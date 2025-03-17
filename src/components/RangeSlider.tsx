import type { FC, InputHTMLAttributes } from "react";

interface RangeSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange: (value: number) => void;
}

export const RangeSlider: FC<RangeSliderProps> = ({ onChange, ...props }) => {
  return (
    <input
      type="range"
      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700"
      onChange={(e) => onChange(Number(e.target.value))}
      {...props}
    />
  );
};
