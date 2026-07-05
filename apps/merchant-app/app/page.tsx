
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  session?.user.id ? redirect("/dashboard") : redirect("/api/auth/signin")
  return (<div>

  </div>

  );
}
