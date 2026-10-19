export const inputClass =
  "w-full bg-[#0F1420] border border-[#242B3D] rounded-md px-3 py-2 text-sm text-[#E7E4DC] placeholder:text-[#5C6580]";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-[#8B93A7] mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-[#5C6580] mt-1">{hint}</span>}
      {error && <span className="block text-xs text-[#D65F5F] mt-1">{error}</span>}
    </label>
  );
}