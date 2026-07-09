import { redirect } from "next/navigation";
import { SendCard } from "../../../components/sendcard";
import { auth } from "@/auth"
export default async function () {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/signin")
    }
    return <div className="w-full">
        <SendCard />
    </div>
}