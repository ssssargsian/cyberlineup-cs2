import { Link2 } from "lucide-react";

import { Badge } from "@/components/Badge";

export function SourceBadge({ name }: { name?: string | null }) {
  if (!name) {
    return <Badge>Ручная запись</Badge>;
  }

  return (
    <Badge className="border-cyan-300/25 bg-cyan-400/10 text-cyan-100">
      <Link2 className="mr-1 h-3 w-3" />
      {name}
    </Badge>
  );
}
