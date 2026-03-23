import NextAuth, { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { NextRequest } from "next/server";
import { Provider } from "next-auth/providers/index";

async function getNextAuthOptions(): Promise<NextAuthOptions> {
  const options = { ...authOptions };
  
  try {
    // Only fetch if prisma client is generated with socialLoginSettings
    if ('socialLoginSettings' in db) {
      const settings = await (db as any).socialLoginSettings?.findFirst();
      
      if (settings) {
        const dbProviders: Provider[] = [];
        
        if (settings.googleEnabled && settings.googleClientId && settings.googleClientSecret) {
          dbProviders.push(
            GoogleProvider({
              clientId: settings.googleClientId,
              clientSecret: settings.googleClientSecret,
            })
          );
        }
        
        if (settings.facebookEnabled && settings.facebookAppId && settings.facebookAppSecret) {
          dbProviders.push(
            FacebookProvider({
              clientId: settings.facebookAppId,
              clientSecret: settings.facebookAppSecret,
            })
          );
        }
        
        if (dbProviders.length > 0) {
          options.providers = [...options.providers, ...dbProviders];
        }
      }
    }
  } catch (error) {
    console.error("Error loading social login settings for NextAuth:", error);
  }
  
  return options;
}

export async function GET(req: NextRequest, ctx: any) {
  const options = await getNextAuthOptions();
  return NextAuth(options)(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  const options = await getNextAuthOptions();
  return NextAuth(options)(req, ctx);
}
