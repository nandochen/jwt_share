import NextAuth from "next-auth" 
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import jwt from "jsonwebtoken"

export default NextAuth({
  secret: process.env.SECRET,
  providers: [ 
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        jwt: { label: "JWT", type: "text" }, // Define a 'jwt' credential
      },
      async authorize(credentials, req) {
        if (!credentials?.token) return null;
        
        try {
          // Example: verify JWT (replace 'SECRET' with your real secret/public key)
          const decoded = jwt.verify(credentials.token, process.env.NEXTAUTH_SECRET);

          // Return a user object (NextAuth stores this in the session)
          return {
            ...decoded
          };
        } catch (err) {
          console.error("Invalid JWT:", err);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // Sign in with passwordless email link
    EmailProvider({
      server: process.env.MAIL_SERVER,
      from: "<no-reply@example.com>",
    }),
  ],
})