import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import db from "@repo/db";


export const authoptions: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_SECRET!
        })
    ],
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: '/signin'
    },
    cookies: {
        sessionToken: {
            name: "merchant-app.session-token"
        }
    },
    callbacks: {
        async signIn({ user, account }) {

            if (!account || account.provider !== "google") {
                return false
            }
            if (!user.email) return false;
            const merchant = await db.merchant.findUnique({
                where: {
                    email: user.email
                }
            })
            if (!merchant) {
                await db.merchant.create({
                    data: {
                        email: user.email!,
                        name: user.name!,
                        auth_type: "google",
                        merchantBalance: {
                            create: {
                                amount: 0
                            }
                        }
                    }
                })
            }


            return true;
        },
        async jwt({ token, user }) {
            if (user?.email) {
                const merchant = await db.merchant.findUnique({
                    where: {
                        email: user.email
                    }
                });
                token.merchantId = merchant?.id.toString();

            }
            return token
        },
        async session({ session, token }
        ) {
            if (token.merchantId) {
                session.user.id = token.merchantId
            }
            return session
        }


    }

}