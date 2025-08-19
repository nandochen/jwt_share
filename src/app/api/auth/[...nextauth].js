import NextAuth from "next-auth" 
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import jwt from "jsonwebtoken"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        jwt: { label: "JWT", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.token) return null;
        try {
          const decoded = jwt.verify(credentials.token, process.env.NEXTAUTH_SECRET);
          return { ...decoded };
        } catch (err) {
          console.error("Invalid JWT:", err);
          return null;
        }
      },
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions);