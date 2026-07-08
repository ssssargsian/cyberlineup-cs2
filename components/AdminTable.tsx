export function AdminTable({
  headers,
  children
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card w-full max-w-full overflow-hidden rounded-[1.5rem]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-[56rem] text-left text-sm text-slate-300">
          <thead className="sticky top-0 bg-white/5 text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-4 font-medium">
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
