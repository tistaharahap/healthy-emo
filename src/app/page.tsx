import { getUserFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getUserFromCookies();
  redirect(session ? "/entries" : "/login");
}
