import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientApp from "@/components/ClientApp";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  return (
    <ClientApp
      userId={session.user.id}
      userName={session.user.name ?? null}
      userImage={session.user.image ?? null}
    />
  );
}
