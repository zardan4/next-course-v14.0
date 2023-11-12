import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { User } from "./app/lib/definitions";
import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";

async function getUser(email: string): Promise<User | undefined> {
    try {
        // parse db for a user with such email
        const user = await sql<User>`
            SELECT * FROM users WHERE email = ${email}
        `
        return user.rows[0];
    } catch (e) {
        // if error throw an error
        console.error('Failed to fetch user:', e)
        throw new Error('Failed to fetch user.')
    }
}

const config = NextAuth({
    ...authConfig,
    // use credentials to auth
    // !! recommended to use OAuth or other providers
    providers: [Credentials({
        async authorize(credentials) {
            // validate the entered credentials
            const validatedCredentials = z
                .object({
                    email: z.string().email(),
                    password: z.string().min(6)
                })
                .safeParse(credentials);

            if (validatedCredentials.success) {
                const { email, password } = validatedCredentials.data;
                // get a user with email
                const user = await getUser(email);
                if (!user) return null;

                // if passwords are matching return a user that means the user is logged in
                const passwordsMatch = await bcrypt.compare(password, user.password);
                console.log(passwordsMatch)
                if (passwordsMatch) return user;
            }

            // otherwise we mean that the user is not logged in
            return null;
        },
    })]
});

export const { signOut, signIn, auth } = config;