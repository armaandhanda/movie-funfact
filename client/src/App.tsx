import { useEffect, useState } from "react";
import { api } from "./api";

type Me = { name?: string|null; email?: string|null; image?: string|null; favoriteMovie?: string|null; };

function Header() {
  return (
    <header className="header">
      <h1>🎬 Movie Fun Facts</h1>
    </header>
  );
}

function Login() {
  const login = () => (window.location.href = "http://localhost:4000/auth/google");
  return (
    <div className="card center">
      <h2>Welcome</h2>
      <p>Sign in to discover fun facts about your favorite movie!</p>
      <button className="btn" onClick={login}>Sign in with Google</button>
    </div>
  );
}

function Onboarding({ onDone }: { onDone: () => void }) {
  const [movie, setMovie] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/api/favorite", { movie });
    onDone();
  };
  return (
    <div className="card center">
      <h2>First time here?</h2>
      <p>Tell us your favorite movie</p>
      <form onSubmit={submit} className="stack gap">
        <input value={movie} onChange={(e)=>setMovie(e.target.value)} placeholder="Your favorite movie" required />
        <button className="btn">Save</button>
      </form>
    </div>
  );
}

function Dashboard({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const [fact, setFact] = useState("Loading...");
  useEffect(() => {
    api.get("/api/fact", { params: { movie: me.favoriteMovie } })
      .then(r => setFact(r.data.fact))
      .catch(() => setFact("Could not fetch a fact right now."));
  }, [me.favoriteMovie]);

  return (
    <div className="card center">
      <div className="row">
        {me.image ? <img src={me.image} width={100} height={100} style={{borderRadius: "50%"}}/> : null}
        <div>
          <div><b>{me.name}</b></div>
          <div className="subtext">{me.email}</div>
        </div>
      </div>
      <hr />
      <div><b>Favorite movie:</b> {me.favoriteMovie}</div>
      <div><b>Fun fact:</b> {fact}</div>
      <button className="btn logout" onClick={onLogout}>Logout</button>
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState<Me|null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try { const { data } = await api.get("/api/me"); setMe(data); }
    catch { setMe(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { refreshMe(); }, []);

  const logout = async () => { await api.post("/api/logout"); setMe(null); };

  if (loading) return null;

  return (
    <div>
      <Header />
      <main className="main">
        {!me ? <Login /> : !me.favoriteMovie ? <Onboarding onDone={refreshMe} /> : <Dashboard me={me} onLogout={logout} />}
      </main>
    </div>
  );
}
