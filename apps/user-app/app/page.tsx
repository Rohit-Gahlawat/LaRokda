
import { Button } from "@repo/ui/buttons";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
// import { PrismaClient } from "@repo/db";
// import { useAtom, balanceAtom, useBalance } from "@repo/store";



export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard")
  } else {
    redirect("/api/auth/signin")
  }
  return (
    <div>


    </div>
  );
}
