import { getCurrentUser } from "@/lib/auth";
import { HomeLanding } from "@/components/home-landing";

export default async function Home() {
  const user = await getCurrentUser();
  return <HomeLanding user={user} />;
}
