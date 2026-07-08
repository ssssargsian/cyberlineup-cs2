export function AdminTable({
  headers,
  children
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card overflow-hidden rounded-[2rem]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-4 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
