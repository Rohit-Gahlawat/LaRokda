import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { userSigninSchema, UserSigninType } from "@repo/zod";
import db from "@repo/db"
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

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
                        email: user.number
                    }
                };
                const hashedpassword = await bcrypt.hash(password, 10);
                try {
                    const newuser = await db.user.create({
                        data: {
                            number: phone,
                            password: hashedpassword
                        }
                    });
                    return {
                        id: newuser.id,
                        name: newuser.name,
                        email: newuser.number

                    }

                } catch (e) {
                    console.log(e)
                    return null
                }

            }
        })
    ],
    secret: process.env.JWT_SECRET,
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


}