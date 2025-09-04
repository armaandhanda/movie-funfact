import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./auth";
import { prisma } from "./prisma";
import { signJwt, verifyJwt } from "./auth";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const FRONTEND_URL = process.env.FRONTEND_URL!;



app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Google OAuth start
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent" }));

// Google OAuth callback - set HTTP-only cookie then redirect to UI
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: FRONTEND_URL + "/login" }),
  async (req, res) => {
    const user = req.user as any;
    const token = signJwt({ uid: user.id });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, 
      maxAge: 7 * 24 * 3600 * 1000,
    });
    res.redirect(FRONTEND_URL);
  }
);

function requireAuth(req: any, res: any, next: any) {
  const token = req.cookies?.token;
  const payload = token ? (verifyJwt(token) as any) : null;
  if (!payload?.uid) return res.status(401).json({ error: "Unauthorized" });
  req.userId = payload.uid;
  next();
}

app.get("/api/me", requireAuth, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ name: user.name, email: user.email, image: user.image, favoriteMovie: user.favoriteMovie });
});

app.post("/api/favorite", requireAuth, async (req: any, res) => {
  const { movie } = req.body as { movie?: string };
  if (!movie) return res.status(400).json({ error: "movie required" });
  await prisma.user.update({ where: { id: req.userId }, data: { favoriteMovie: movie } });
  res.json({ ok: true });
});

app.get("/api/fact", requireAuth, async (req, res) => {
  const movie = String(req.query.movie || "");
  if (!movie) return res.status(400).json({ error: "movie required" });

  const prompt = `Give one concise, accurate, interesting fact about the movie "${movie}". 1–2 sentences. Avoid spoilers. Vary the angle each time.`;
  console.log("Fetching fact for:", movie);
  console.log("Using key:", process.env.OPENAI_API_KEY?.slice(0, 5) + "...");

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    }),
  }).catch(() => null);

  if (!r || !r.ok) return res.json({ fact: "Could not fetch a fact right now." });
  const j = await r.json();
  const fact = j?.choices?.[0]?.message?.content?.trim() ?? "Could not fetch a fact right now.";
  res.json({ fact });
});

app.post("/api/logout", (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
