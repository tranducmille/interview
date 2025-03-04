import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session: async ({ session, user }: any) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};