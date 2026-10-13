import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { HomeRedirect } from "@/components/HomeRedirect";

const FEATURES = [
  { t: "A plan built for you", d: "Tell us your goal, level, schedule and equipment. Get a day-by-day weekly split — push/pull/legs, upper/lower or full body." },
  { t: "870+ exercise demos", d: "Every move shows start and finish positions, step-by-step form cues, and the muscles it hits." },
  { t: "Gym, home or outdoor", d: "Switch any day between gym machines, dumbbells at home, or bodyweight in the park. The plan adapts." },
  { t: "Gym machine guide", d: "New to the gym? See what to do on the cable station, smith machine, leg press and more." },
  { t: "Log every set", d: "Tick off sets, record weight and reps, and run a rest timer between sets." },
  { t: "Track your progress", d: "Body-weight chart, workout streaks and session history keep you consistent." },
];

const STEPS = [
  ["01", "Create your account", "Sign up with your email in seconds."],
  ["02", "Share your basics", "Age, height, weight, goal, injuries and where you train."],
  ["03", "Get your weekly plan", "Know exactly what to train every day — and how."],
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <HomeRedirect />
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-2">
          <LinkButton href="/login/" variant="ghost" className="px-3">Log in</LinkButton>
          <LinkButton href="/signup/" className="px-4 py-2.5">Start free</LinkButton>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime">Train smart · Build muscle</p>
            <h1 className="font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl lg:text-7xl">
              Your plan.<br />Your body.<br /><span className="text-accent">Every rep.</span>
            </h1>
            <p className="max-w-md text-lg text-muted">
              FITFUEL builds a weekly workout plan from your health details and shows you exactly how to do every exercise — at the gym, at home or outdoors.
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/signup/" className="px-7 py-4 text-lg">Build my plan</LinkButton>
              <LinkButton href="/exercises/" variant="outline" className="px-7 py-4 text-lg">Browse exercises</LinkButton>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="rotate-2 rounded-3xl border border-line bg-surface p-3 shadow-2xl shadow-accent/10">
              <ExerciseDemo images={["Barbell_Squat/0.jpg", "Barbell_Squat/1.jpg"]} name="Barbell Squat" />
              <div className="flex items-center justify-between px-2 pb-1 pt-3">
                <div>
                  <p className="font-display text-lg uppercase">Barbell Squat</p>
                  <p className="text-sm text-muted">Quads · Glutes · Hamstrings</p>
                </div>
                <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-black">4 × 8–12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 font-display text-3xl uppercase tracking-wide">Everything you need to grow</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="mb-2 font-display text-xl uppercase tracking-wide text-accent">{f.t}</h3>
              <p className="text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 font-display text-3xl uppercase tracking-wide">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <li key={n} className="rounded-2xl border border-line p-6">
              <span className="font-display text-5xl text-accent/80">{n}</span>
              <h3 className="mt-3 text-lg font-bold">{t}</h3>
              <p className="text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-3xl bg-accent p-8 text-black md:flex md:items-center md:justify-between">
          <p className="font-display text-3xl uppercase">Ready to start lifting?</p>
          <LinkButton href="/signup/" className="mt-4 bg-black text-white hover:brightness-125 md:mt-0">Create free account</LinkButton>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-line px-4 py-8 text-sm text-muted">
        <p>FITFUEL gives general fitness guidance, not medical advice. Check with a doctor before starting a new program, especially with injuries or health conditions.</p>
        <p className="mt-2">Exercise images: free-exercise-db (public domain).</p>
      </footer>
    </div>
  );
}
