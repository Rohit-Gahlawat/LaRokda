import NextAuth from "next-auth";
import { authoptions } from "../../../../lib/auth";
const { handlers, signIn, signOut, auth } = NextAuth(authoptions);





export const { GET, POST } = handlers;