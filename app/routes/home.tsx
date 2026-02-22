import type { Route } from "./+types/home";
import {
  data,
  redirect,
  Form,
  Await,
  useFetcher,
  useNavigation,
} from "react-router";
import { Suspense, useState, useRef, useEffect } from "react";
import { requireUserId, getUserId } from "~/server/session.server";
import {
  createKudos,
  getLatestKudos,
  getNotificationsForUser,
  deleteKudos,
  markNotificationsReadForUser,
  parseBgColor,
  parseEmojiType,
  type KudosFeedItem,
  type Notification,
} from "~/server/kudos.server";
import { getAllUsers } from "~/server/users.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feeds | Givem" },
    {
      name: "description",
      content: "Give kudos to your teammates. Celebrate wins, big and small.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);

  const users = await getAllUsers(200);

  // Defer the feed and notifications so the page renders fast
  const latestPromise = getLatestKudos(40);
  const notificationsPromise = userId
    ? getNotificationsForUser(userId, 20)
    : Promise.resolve([] as Notification[]);

  return data({
    users,
    userId,
    latest: latestPromise,
    notifications: notificationsPromise,
  });
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const intent = form.get("_action");

  if (intent === "create") {
    const recipientId = String(form.get("recipientId") ?? "");
    const content = String(form.get("content") ?? "").trim();
    const backgroundColor = parseBgColor(form.get("backgroundColor"));
    const emojisType = parseEmojiType(form.get("emojisType"));

    if (!recipientId || !content) {
      return data(
        { error: "Recipient and message are required." },
        { status: 400 },
      );
    }
    if (recipientId === userId) {
      return data(
        { error: "You can't give kudos to yourself 😅" },
        { status: 400 },
      );
    }
    if (content.length > 500) {
      return data(
        { error: "Message too long (max 500 chars)." },
        { status: 400 },
      );
    }

    try {
      await createKudos({
        authorId: userId,
        recipientId,
        content,
        backgroundColor,
        emojisType,
      });
    } catch {
      return data(
        { error: "Something went wrong, try again." },
        { status: 500 },
      );
    }

    return redirect("/home");
  }

  if (intent === "delete") {
    const kudosId = String(form.get("kudosId") ?? "");
    if (!kudosId) return data({ error: "Missing kudos id" }, { status: 400 });
    await deleteKudos(kudosId, userId);
    return redirect("/home");
  }

  if (intent === "mark-read") {
    await markNotificationsReadForUser(userId);
    return redirect("/home");
  }

  return data({ error: "Unknown action" }, { status: 400 });
}

const BG_STYLES: Record<
  string,
  { card: string; badge: string; emoji: string }
> = {
  RED: {
    card: "bg-gradient-to-br from-rose-50 to-red-100 border-red-200",
    badge: "bg-red-100 text-red-700",
    emoji: "🌹",
  },
  BLUE: {
    card: "bg-gradient-to-br from-sky-50 to-blue-100 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    emoji: "💙",
  },
  YELLOW: {
    card: "bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    emoji: "⭐",
  },
  GREEN: {
    card: "bg-gradient-to-br from-emerald-50 to-green-100 border-green-200",
    badge: "bg-green-100 text-green-700",
    emoji: "🌿",
  },
};

const EMOJIS: Record<string, string> = {
  THUMBS_UP: "👍",
  SMILING: "😊",
  APPREACIATED: "👏",
};

function getBg(color: string | null | undefined) {
  return BG_STYLES[color ?? ""] ?? BG_STYLES.RED;
}

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function KudosCard({ k, userId }: { k: KudosFeedItem; userId: string | null }) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== "idle";
  const bg = getBg(k.backgroundColor);

  return (
    <article
      className={`group relative rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${bg.card} ${isDeleting ? "opacity-50 scale-95" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${bg.badge}`}
        >
          {k.authorName?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-800 truncate">
              {k.authorName ?? "Someone"}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg" title={k.emojisType ?? ""}>
                {EMOJIS[k.emojisType ?? ""] ?? "👍"}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(k.createdAt)}
              </span>
            </div>
          </div>

          <p className="mt-1.5 text-sm text-gray-700 leading-relaxed">
            {k.content}
          </p>
        </div>
      </div>

      {userId === k.authorId && (
        <fetcher.Form
          method="post"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <input type="hidden" name="_action" value="delete" />
          <input type="hidden" name="kudosId" value={k.id} />
          <button
            type="submit"
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        </fetcher.Form>
      )}
    </article>
  );
}

function NotificationItem({ n }: { n: Notification }) {
  return (
    <div
      className={`rounded-xl p-3 transition-all ${
        n.isRead
          ? "bg-white border border-gray-100"
          : "bg-violet-50 border border-violet-200 shadow-sm"
      }`}
    >
      {!n.isRead && (
        <span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-2 align-middle" />
      )}
      <p className="text-sm text-gray-700 inline">
        <span className="font-semibold">{n.authorName ?? "Someone"}</span> sent
        you a kudo ✨
      </p>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</p>
      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
    </div>
  );
}

function GiveKudosForm({
  users,
  userId,
  actionData,
}: {
  users: { id: string; name: string; email: string }[];
  userId: string | null;
  actionData: { error?: string } | undefined;
}) {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state !== "idle" &&
    navigation.formData?.get("_action") === "create";
  const formRef = useRef<HTMLFormElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState("RED");
  const [selectedEmoji, setSelectedEmoji] = useState("THUMBS_UP");

  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.error) {
      formRef.current?.reset();
      setCharCount(0);
      setSelectedColor("RED");
      setSelectedEmoji("THUMBS_UP");
    }
  }, [navigation.state, actionData?.error]);

  const bg = getBg(selectedColor);

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-colors duration-300 ${bg.card}`}
    >
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">{bg.emoji}</span>
        Give Kudos
      </h2>

      <Form ref={formRef} method="post" className="space-y-4">
        <input type="hidden" name="_action" value="create" />
        <input type="hidden" name="backgroundColor" value={selectedColor} />
        <input type="hidden" name="emojisType" value={selectedEmoji} />

        {/* Recipient */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            To
          </label>
          <select
            name="recipientId"
            required
            className="w-full px-3 py-2.5 bg-white/70 backdrop-blur border-2 border-white rounded-xl text-sm focus:outline-none focus:border-violet-400 transition-colors"
          >
            <option value="">Choose someone awesome…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id} disabled={u.id === userId}>
                {u.name} {u.id === userId ? "(you)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Color + Emoji row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Color
            </label>
            <div className="flex gap-2">
              {(["RED", "BLUE", "YELLOW", "GREEN"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === c
                      ? "scale-125 border-gray-600 shadow"
                      : "border-transparent opacity-70"
                  } ${c === "RED" ? "bg-red-400" : c === "BLUE" ? "bg-blue-400" : c === "YELLOW" ? "bg-amber-400" : "bg-emerald-400"}`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
              Vibe
            </label>
            <div className="flex gap-2">
              {(["THUMBS_UP", "SMILING", "APPREACIATED"] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setSelectedEmoji(e)}
                  className={`text-xl p-1 rounded-lg transition-all ${
                    selectedEmoji === e
                      ? "scale-125 bg-white/80 shadow"
                      : "opacity-60 hover:opacity-90"
                  }`}
                >
                  {EMOJIS[e]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Message
          </label>
          <textarea
            name="content"
            required
            maxLength={500}
            rows={3}
            placeholder="Say something wonderful…"
            className="w-full px-3 py-2.5 bg-white/70 backdrop-blur border-2 border-white rounded-xl text-sm resize-none focus:outline-none focus:border-violet-400 transition-colors"
            onChange={(e) => setCharCount(e.target.value.length)}
          />
          <div className="text-right text-xs text-gray-400 mt-0.5">
            {charCount}/500
          </div>
        </div>

        {actionData?.error && (
          <div
            className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl"
            aria-live="polite"
          >
            <span>⚠️</span> {actionData.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                  className="opacity-75"
                />
              </svg>
              Sending…
            </>
          ) : (
            <>🚀 Send Kudos</>
          )}
        </button>
      </Form>
    </div>
  );
}

function SignOutForm() {
  const isSubmitting = useNavigation().state !== "idle";
  return (
    <Form method="POST" action="/logout">
      <button
        disabled={isSubmitting}
        className="px-3 md:px-4 py-2 text-sm font-black text-white bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-violet-200"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
                className="opacity-75"
              />
            </svg>
          </>
        ) : (
          "Sign out"
        )}
      </button>
    </Form>
  );
}

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  const { users, userId, latest, notifications } = loaderData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <span className="text-2xl">🎉</span>
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Givem
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-1 text-sm">
            <a
              href="#feed"
              className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              Feed
            </a>
            <a
              href="#notifications"
              className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              Inbox
            </a>
          </nav>
          <SignOutForm />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Left: Users list ── */}
        <aside className="lg:col-span-3">
          <div className="sticky top-20 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span>👥</span> Team
            </h3>
            <ul className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
              {users.map((u) => {
                const isMe = userId === u.id;
                return (
                  <li
                    key={u.id}
                    className={`flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors ${isMe ? "bg-violet-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {u.name}{" "}
                        {isMe && (
                          <span className="text-xs font-normal text-violet-500">
                            (you)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {u.email}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* ── Center: Form + Feed ── */}
        <main id="feed" className="lg:col-span-6 space-y-5">
          <GiveKudosForm
            users={users}
            userId={userId}
            actionData={actionData}
          />

          {/* Feed */}
          <section>
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>✨</span> Recent Kudos
            </h2>
            <Suspense
              fallback={
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-2xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <Await
                resolve={latest}
                errorElement={
                  <div className="text-red-500 text-sm bg-red-50 rounded-xl p-4 border border-red-200">
                    Failed to load feed. Please refresh.
                  </div>
                }
              >
                {(resolvedLatest) => (
                  <div className="space-y-3">
                    {resolvedLatest.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-2">🌱</p>
                        <p className="font-medium">
                          No kudos yet — be the first!
                        </p>
                      </div>
                    ) : (
                      resolvedLatest.map((k) => (
                        <KudosCard key={k.id} k={k} userId={userId} />
                      ))
                    )}
                  </div>
                )}
              </Await>
            </Suspense>
          </section>
        </main>

        {/* ── Right: Notifications ── */}
        <aside id="notifications" className="lg:col-span-3">
          <div className="sticky top-20 bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-1.5">
                <span>🔔</span> Inbox
              </h3>
              <Form method="post">
                <input type="hidden" name="_action" value="mark-read" />
                <button className="text-xs text-violet-500 hover:text-violet-700 font-medium transition-colors">
                  Mark all read
                </button>
              </Form>
            </div>

            <Suspense
              fallback={
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              }
            >
              <Await
                resolve={notifications}
                errorElement={
                  <p className="text-sm text-red-500">
                    Could not load notifications.
                  </p>
                }
              >
                {(resolvedNotifications) => (
                  <div className="space-y-2 max-h-[55vh] overflow-y-auto">
                    {resolvedNotifications.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">
                        All caught up! 🎉
                      </p>
                    ) : (
                      resolvedNotifications.map((n) => (
                        <NotificationItem key={n.id} n={n} />
                      ))
                    )}
                  </div>
                )}
              </Await>
            </Suspense>
          </div>
        </aside>
      </div>
    </div>
  );
}
