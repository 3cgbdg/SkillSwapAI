import { redirect } from "next/navigation";

export default function ActiveMatchesRedirect() {
  redirect("/matches?tab=active");
}
