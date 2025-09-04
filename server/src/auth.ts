import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  JWT_SECRET
} = process.env as Record<string, string>;

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID!,
    clientSecret: GOOGLE_CLIENT_SECRET!,
    callbackURL: GOOGLE_CALLBACK_URL!,
  },
  async (_at, _rt, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value!;
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: profile.displayName,
          image: profile.photos?.[0]?.value,
          googleId: profile.id,
        },
        create: {
          email,
          name: profile.displayName,
          image: profile.photos?.[0]?.value,
          googleId: profile.id,
        },
      });
      return done(null, user);
    } catch (e) {
      done(e as any, undefined);
    }
  }
));

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyJwt(token: string) {
  try { return jwt.verify(token, JWT_SECRET!); }
  catch { return null; }
}
