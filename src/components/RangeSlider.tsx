import type { FC } from "react";

interface RangeSliderProps {
  id: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

export const RangeSlider: FC<RangeSliderProps> = ({
  id,
  min,
  max,
  step = 1,
  value,
  onChange,
}) => {
  return (
    <input
      id={id}
      type="range"
      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm dark:bg-gray-700"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
};
