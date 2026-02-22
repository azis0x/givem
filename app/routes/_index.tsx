import type { Route } from "./+types/_index";
import { Link, redirect } from "react-router";
import { getUser } from "~/server/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Spread the love 🎉 | Givem" },
    {
      name: "description",
      content: "Give kudos to your teammates. Celebrate wins, big and small.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (user) throw redirect("/home");
  return null;
}

const FLOATING_KUDOS = [
  {
    emoji: "🌟",
    color: "bg-yellow-200 border-yellow-300",
    rotate: "-rotate-6",
    top: "top-12",
    left: "left-6",
    delay: "animation-delay-0",
  },
  {
    emoji: "💜",
    color: "bg-violet-200 border-violet-300",
    rotate: "rotate-3",
    top: "top-8",
    right: "right-10",
    delay: "animation-delay-200",
  },
  {
    emoji: "🎊",
    color: "bg-pink-200 border-pink-300",
    rotate: "-rotate-3",
    bottom: "bottom-20",
    left: "left-16",
    delay: "animation-delay-400",
  },
  {
    emoji: "👏",
    color: "bg-blue-200 border-blue-300",
    rotate: "rotate-6",
    bottom: "bottom-16",
    right: "right-8",
    delay: "animation-delay-600",
  },
  {
    emoji: "🔥",
    color: "bg-orange-200 border-orange-300",
    rotate: "-rotate-2",
    top: "top-1/3",
    left: "left-4",
    delay: "animation-delay-100",
  },
  {
    emoji: "✨",
    color: "bg-emerald-200 border-emerald-300",
    rotate: "rotate-2",
    top: "top-1/3",
    right: "right-4",
    delay: "animation-delay-300",
  },
];

const FEATURES = [
  {
    emoji: "🎯",
    title: "Spot the wins",
    desc: "Notice something awesome? Call it out instantly.",
    bg: "bg-yellow-100 border-yellow-200",
    accent: "text-yellow-600",
  },
  {
    emoji: "🌈",
    title: "Make it pop",
    desc: "Pick colors and vibes that match the moment.",
    bg: "bg-pink-100 border-pink-200",
    accent: "text-pink-600",
  },
  {
    emoji: "🔔",
    title: "Feel the love",
    desc: "Get notified when someone cheers for you.",
    bg: "bg-violet-100 border-violet-200",
    accent: "text-violet-600",
  },
];

const SAMPLE_CARDS = [
  {
    from: "Alex",
    to: "Jordan",
    msg: "Crushed that demo yesterday 🚀 The client was blown away!",
    emoji: "👏",
    bg: "bg-gradient-to-br from-violet-100 to-purple-200 border-violet-300",
    avatar: "bg-violet-300 text-violet-800",
    rotate: "-rotate-2",
  },
  {
    from: "Sam",
    to: "Morgan",
    msg: "Thank you for staying late to help ship the feature. You're a legend.",
    emoji: "🌟",
    bg: "bg-gradient-to-br from-amber-100 to-yellow-200 border-yellow-300",
    avatar: "bg-amber-300 text-amber-800",
    rotate: "rotate-1",
  },
  {
    from: "Taylor",
    to: "Casey",
    msg: "Your code review feedback is always so thoughtful. Makes us all better.",
    emoji: "😊",
    bg: "bg-gradient-to-br from-emerald-100 to-green-200 border-green-300",
    avatar: "bg-emerald-300 text-emerald-800",
    rotate: "-rotate-1",
  },
];

export default function Index() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-12px) rotate(var(--r, 0deg)); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes drift {
          0% { transform: translateX(0) rotate(var(--r, 0deg)); }
          33% { transform: translateX(6px) rotate(calc(var(--r, 0deg) + 2deg)); }
          66% { transform: translateX(-4px) rotate(calc(var(--r, 0deg) - 2deg)); }
          100% { transform: translateX(0) rotate(var(--r, 0deg)); }
        }
        .float-card {
          animation: float 4s ease-in-out infinite;
        }
        .float-card:nth-child(2) { animation-duration: 5s; animation-delay: 0.5s; }
        .float-card:nth-child(3) { animation-duration: 3.5s; animation-delay: 1s; }
        .float-card:nth-child(4) { animation-duration: 4.5s; animation-delay: 0.2s; }
        .float-card:nth-child(5) { animation-duration: 6s; animation-delay: 0.8s; }
        .float-card:nth-child(6) { animation-duration: 3.8s; animation-delay: 1.2s; }
        .pop-in { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        .pop-in-1 { animation-delay: 0.1s; }
        .pop-in-2 { animation-delay: 0.2s; }
        .pop-in-3 { animation-delay: 0.3s; }
        .pop-in-4 { animation-delay: 0.4s; }
        .sample-card { animation: drift 6s ease-in-out infinite; }
        .sample-card:nth-child(2) { animation-duration: 7s; animation-delay: 1s; }
        .sample-card:nth-child(3) { animation-duration: 5.5s; animation-delay: 0.5s; }
        .btn-bounce:hover { animation: wiggle 0.4s ease-in-out; }
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-200 opacity-50 blur-3xl" />
        <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-pink-200 opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-72 rounded-full bg-amber-200 opacity-40 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-emerald-200 opacity-30 blur-3xl" />
        <div className="noise fixed inset-0" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur border-b border-white/80">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          <span className="text-xl font-black bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
            Givem
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-violet-600 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-black text-white bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-200"
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 pt-10 pb-20 overflow-hidden">
        {/* Floating emoji stickers */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {FLOATING_KUDOS.map((item, i) => (
            <div
              key={i}
              className={`float-card absolute text-3xl ${item.rotate}`}
              style={{
                top: item.top,
                left: (item as any).left,
                right: (item as any).right,
                bottom: (item as any).bottom,
              }}
            >
              <div
                className={`w-14 h-14 rounded-2xl border-2 ${item.color} flex items-center justify-center shadow-md`}
              >
                {item.emoji}
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div className="pop-in pop-in-1 inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/80 rounded-full border border-violet-200 text-sm font-bold text-violet-600 shadow-sm mb-6">
          <span>✨</span> Free to use, forever
        </div>

        {/* Headline */}
        <h1 className="pop-in pop-in-2 text-5xl sm:text-7xl font-black text-gray-900 leading-[1.05] mb-5 max-w-2xl">
          Give kudos.
          <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              Make someone's day.
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-violet-300 via-pink-300 to-amber-200 rounded-full opacity-60" />
          </span>
        </h1>

        {/* Sub */}
        <p className="pop-in pop-in-3 text-lg sm:text-xl text-gray-500 max-w-md mb-10 leading-relaxed">
          A tiny app for celebrating teammates.
          <br />
          No metrics. No dashboards. Just{" "}
          <span className="font-bold text-pink-500">genuine appreciation</span>.
        </p>

        {/* CTAs */}
        <div className="pop-in pop-in-4 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/signup"
            className="btn-bounce inline-flex items-center gap-2 px-8 py-4 text-lg font-black text-white bg-gradient-to-r from-violet-600 to-pink-500 rounded-3xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-violet-200"
          >
            Start giving kudos 🚀
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-gray-600 bg-white/80 rounded-3xl border-2 border-gray-200 hover:border-violet-300 hover:text-violet-600 transition-all"
          >
            I have an account
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 text-xs animate-bounce">
          <span>scroll</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* ── Sample cards (drifting) ── */}
      <section className="py-16 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl font-black text-gray-800 mb-2">
            Real talk. Real people. 💬
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Here's what kudos looks like in the wild.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-stretch">
            {SAMPLE_CARDS.map((card, i) => (
              <div
                key={i}
                className={`sample-card flex-1 max-w-xs mx-auto rounded-3xl border-2 p-5 shadow-lg ${card.bg} ${card.rotate}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${card.avatar}`}
                  >
                    {card.from[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-700">
                      {card.from}
                    </div>
                    <div className="text-xs text-gray-400">→ {card.to}</div>
                  </div>
                  <span className="ml-auto text-2xl">{card.emoji}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                  "{card.msg}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-3xl font-black text-gray-800 mb-2">
            Simple by design 🎨
          </h2>
          <p className="text-center text-gray-400 mb-12">
            No BS. No bloat. Just warmth.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`rounded-3xl border-2 p-6 ${f.bg} text-center transition-all hover:scale-105 hover:shadow-lg cursor-default`}
              >
                <div className="text-4xl mb-3">{f.emoji}</div>
                <h3 className={`text-lg font-black mb-2 ${f.accent}`}>
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-[2rem] p-10 text-center shadow-2xl shadow-violet-200 relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute top-4 left-10 text-4xl select-none opacity-40">
            ⭐
          </div>
          <div className="absolute bottom-4 right-10 text-4xl select-none opacity-40">
            🎊
          </div>

          <div className="relative">
            <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-2">
              Ready?
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Someone on your team
              <br />
              deserves a shoutout right now.
            </h2>
            <p className="text-white/70 mb-8 text-base">
              Takes 10 seconds. Means a lot.
            </p>

            <Link
              to="/signup"
              className="btn-bounce inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-black text-lg rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Give your first kudo 🎉
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <span>Made with </span>
        <span className="text-pink-500">💜</span>
        <span> · Givem · {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
