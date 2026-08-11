import fs from "fs";

const items = [
  { json: "tmp-sheet.json", out: "src/components/ui/sheet.tsx" },
  { json: "tmp-use-mobile.json", out: "src/hooks/use-mobile.ts" },
  { json: "tmp-command.json", out: "src/components/ui/command.tsx" },
  { json: "tmp-sidebar.json", out: "src/components/ui/sidebar.tsx" },
];

for (const { json, out } of items) {
  if (!fs.existsSync(json)) continue;
  const j = JSON.parse(fs.readFileSync(json, "utf8"));
  const file = j.files?.[0];
  if (!file) continue;
  let c = file.content
    .replaceAll("@/registry/base-nova/", "@/")
    .replaceAll(
      'import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"',
      'import { PanelLeft } from "lucide-react"'
    )
    .replace(/<IconPlaceholder[\s\S]*?\/>/, '<PanelLeft className="size-4" />');
  fs.mkdirSync(out.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(out, c);
  console.log("wrote", out);
}
