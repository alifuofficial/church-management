import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  denomination: z.string().optional(),
  faithStatus: z.string().optional(),
  localChurch: z.string().optional(),
  interests: z.string().optional(),
  acceptedTerms: z.boolean().optional(),
  acceptedPrivacy: z.boolean().optional(),
  acceptedStatementOfFaith: z.boolean().optional(),
});

async function main() {
  const db = new PrismaClient();
  
  try {
    const pld = {
      email: "test@example.com",
      password: "Password123!",
      name: "Test",
      username: "testuser",
      country: '',
      city: '',
      timezone: '',
      denomination: '',
      faithStatus: '',
      localChurch: '',
      interests: '',
      acceptedTerms: true,
      acceptedPrivacy: true,
      acceptedStatementOfFaith: true,
      role: 'MEMBER',
    };
    
    const parsed = userSchema.safeParse(pld);
    console.log("Zod parse:", parsed.success ? "Success" : parsed.error);
    
    const hasSocialLogin = !!(db as any).socialLoginSettings;
    console.log("has social login settings?", hasSocialLogin);
    
  } catch (err) {
    console.error(err);
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);
