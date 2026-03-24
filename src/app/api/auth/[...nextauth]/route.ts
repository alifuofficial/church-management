import NextAuth, { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { NextRequest } from "next/server";
import { Provider } from "next-auth/providers/index";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

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
        
        if (settings.telegramEnabled && settings.telegramBotToken) {
          dbProviders.push(
            CredentialsProvider({
              id: 'telegram',
              name: 'Telegram',
              credentials: {
                id: { label: "ID", type: "text" },
                first_name: { label: "First Name", type: "text" },
                last_name: { label: "Last Name", type: "text" },
                username: { label: "Username", type: "text" },
                photo_url: { label: "Photo URL", type: "text" },
                auth_date: { label: "Auth Date", type: "text" },
                hash: { label: "Hash", type: "text" }
              },
              async authorize(credentials) {
                if (!credentials?.hash || !credentials?.id) return null;
                
                // Extract only telegram payload fields to validate hash
                // Note: The payload must be validated identically to how Telegram passes it
                const fieldsMap = Object.keys(credentials)
                  .filter(key => key !== 'hash' && credentials[key] !== "undefined" && credentials[key] !== "")
                  .reduce((acc: any, key) => { acc[key] = credentials[key]; return acc; }, {});

                const dataCheckString = Object.keys(fieldsMap)
                  .sort()
                  .map(key => `${key}=${fieldsMap[key]}`)
                  .join('\n');
                  
                const secretKey = crypto.createHash('sha256').update(settings.telegramBotToken!).digest();
                const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
                
                if (hash !== credentials.hash) {
                  console.error('Telegram hash variation:', hash, credentials.hash);
                  return null;
                }
                
                const account = await db.oAuthAccount.findFirst({
                  where: { provider: 'telegram', providerAccountId: credentials.id }
                });
                
                let user: any = null;
                if (account) {
                  user = await db.user.findUnique({ where: { id: account.userId } });
                }
                
                if (!user) {
                  user = await db.user.create({
                    data: {
                      name: credentials.first_name + (credentials.last_name && credentials.last_name !== 'undefined' ? ` ${credentials.last_name}` : ''),
                      username: credentials.username && credentials.username !== 'undefined' ? credentials.username : `tg_${credentials.id}`,
                      email: `tg_${credentials.id}@telegram.local`,
                      isVerified: true,
                      image: credentials.photo_url && credentials.photo_url !== 'undefined' ? credentials.photo_url : null,
                    }
                  });
                  await db.oAuthAccount.create({
                    data: {
                      userId: user.id,
                      provider: 'telegram',
                      providerAccountId: credentials.id,
                    }
                  });
                }
                if (!user) return null;

                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  role: user.role
                };
              }
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
