import { Link2 } from "lucide-react";

import { Badge } from "@/components/Badge";

export function SourceBadge({ name }: { name?: string | null }) {
  if (!name) {
    return <Badge>Ручная запись</Badge>;
  }

  return (
    <Badge className="border-violet-400/25 bg-violet-500/12 text-violet-200">
      <Link2 className="mr-1 h-3 w-3" />
      {name}
    </Badge>
  );
}
