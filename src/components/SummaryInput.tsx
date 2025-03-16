import {
  ChangeEvent,
  useRef,
  type FC,
  type TextareaHTMLAttributes,
} from "react";

export interface SummaryInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  onChange?: (value: string) => void;
}

const SUMMARY_LIMIT = 300;

export const SummaryInput: FC<SummaryInputProps> = (props) => {
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length > SUMMARY_LIMIT) return;
    props?.onChange?.(value);
  };

  const handleLimiterClick = () => summaryRef?.current?.focus();

  return (
    <div className="bg-gray-800/50 rounded-xl text-white focus-within:ring-2 focus-within:ring-blue-500 border border-gray-700">
      <textarea
        ref={summaryRef}
        id="summary"
        rows={4}
        className="bg-transparent text-lg w-full p-4 placeholder-gray-500 outline-none border-none"
        {...props}
        onChange={handleChange}
      />
      <div
        aria-hidden
        className="py-2 px-4 text-right cursor-text"
        onClick={handleLimiterClick}
      >
        {summaryRef?.current?.value?.length ?? 0}/{SUMMARY_LIMIT}
      </div>
    </div>
  );
};
