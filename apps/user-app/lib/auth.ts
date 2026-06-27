import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { userSigninSchema, UserSigninType } from "@repo/zod";
import db from "@repo/db"
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { NextAuthConfig } from "next-auth";


export const authoptions = {
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "1212111212" },
                password: { label: "Password", type: "password" }
            },

            async authorize(credentials) {

                const parsed = userSigninSchema.safeParse(credentials);

                if (!parsed.success) {
                    return null;
                }
                const { phone, password }: UserSigninType = parsed.data;

                const user = await db.user.findUnique({
                    where: {
                        number: phone
                    }
                })
                if (user) {
                    const passwordValidation = await bcrypt.compare(
                        password, user.password
                    );
                    if (!passwordValidation) {
                        return null
                    };

                    return {
                        id: user.id,
                        name: user.name,
                        number: user.number
                    }
                }
                return null

            }
        })
    ],
    pages: {
        signIn: "/signin"
    },
    secret: process.env.JWT_SECRET,
    cookies: {
        sessionToken: {
            name: "user-app.session-token"
        }
    },
    callbacks: {
        async session({ token, session }: {
            token: JWT,
            session: Session
        }) {
            {
                session.user = {
                    ...session.user,
                    id: token.sub
                }
                return session
            }
        }
    }


} satisfies NextAuthConfig;
