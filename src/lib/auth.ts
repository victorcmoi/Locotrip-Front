import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "@/types/auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          if (!loginRes.ok) {
            throw new Error("Email ou mot de passe incorrect");
          }

          const { accessToken, refreshToken } = await loginRes.json();
          
          const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
          
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${payload.sub}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!userRes.ok) {
            throw new Error("Impossible de récupérer les informations utilisateur");
          }

          const user = await userRes.json();

          return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000;
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.first_name = token.first_name;
      session.user.last_name = token.last_name;
      session.user.name = token.name;
      session.user.role = token.role;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,
};

// Fonction pour rafraîchir le token
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    if (!res.ok) {
      throw new Error("Erreur lors du rafraîchissement du token");
    }

    const data = await res.json();

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
    };
  } catch (error) {
    console.error("Erreur de rafraîchissement du token:", error);
    
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
