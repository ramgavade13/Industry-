type KPICardProps = {
  title: string;
  value: string;
  change?: string;
  description?: string;
};

export default function KPICard({
  title,
  value,
  change,
  description,
}: KPICardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </h2>

      {change && (
        <p className="mt-2 text-sm font-semibold text-green-600">
          {change}
        </p>
      )}

      {description && (
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}