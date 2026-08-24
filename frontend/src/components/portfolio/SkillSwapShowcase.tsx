import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const skillSwapScreens = ["matches", "plan", "chat"] as const;
export type SkillSwapScreen = (typeof skillSwapScreens)[number];

const nav = [
  { label: "Home", icon: LayoutDashboard, screen: "home" },
  { label: "Discover", icon: Compass, screen: "matches" },
  { label: "Learning", icon: BookOpen, screen: "plan" },
  { label: "Messages", icon: MessageCircle, screen: "chat" },
  { label: "Schedule", icon: Calendar, screen: "schedule" },
] as const;

function BrandMark() {
  return (
    <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
      <WandSparkles size={21} />
    </span>
  );
}

function Shell({
  screen,
  children,
}: {
  screen: SkillSwapScreen;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card px-4 py-5 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <BrandMark />
          <div>
            <p className="font-heading text-lg font-bold leading-none">
              SkillSwap
            </p>
            <p className="mt-1 text-xs font-semibold text-primary">
              AI-powered learning
            </p>
          </div>
        </div>
        <nav className="mt-10 space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.screen === screen;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon size={19} />
                {item.label}
                {item.label === "Messages" ? (
                  <span
                    className={cn(
                      "ml-auto flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                      active
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    3
                  </span>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border bg-muted/60 p-4">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Sparkles size={16} className="text-brand-accent" /> AI matching is
            on
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Your recommendations improved after the last session.
          </p>
        </div>
      </aside>
      <header className="fixed inset-x-0 top-0 z-10 flex h-[72px] items-center justify-between border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:ml-64 lg:px-8">
        <div className="hidden w-full max-w-[420px] items-center gap-3 rounded-xl border bg-background px-4 py-2.5 text-sm text-muted-foreground md:flex">
          <Search size={17} /> Search people, skills, or topics…
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground">
            <Bell size={18} />
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-accent-teach-soft font-bold text-accent-teach">
            BT
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold">Bogdan</p>
            <p className="text-xs text-muted-foreground">Full-stack engineer</p>
          </div>
        </div>
      </header>
      <main className="min-h-screen px-4 pb-8 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}

function Header({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <p className="flex items-center gap-2 text-sm font-bold text-primary">
          <Sparkles size={16} />
          {eyebrow}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}

function SkillTag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "teach" | "learn";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-bold",
        tone === "teach"
          ? "bg-accent-teach-soft text-accent-teach"
          : "bg-accent-learn-soft text-accent-learn"
      )}
    >
      {children}
    </span>
  );
}

function MatchCard({
  name,
  subtitle,
  compatibility,
  teach,
  learn,
  initials,
  featured = false,
}: {
  name: string;
  subtitle: string;
  compatibility: number;
  teach: string[];
  learn: string[];
  initials: string;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm",
        featured && "border-primary/35 ring-2 ring-primary/10"
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-teach-soft text-lg font-bold text-accent-teach">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-heading text-lg font-bold">{name}</h2>
            {featured ? (
              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide text-primary">
                Top
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
          <svg
            aria-hidden="true"
            className="absolute inset-1 -rotate-90"
            viewBox="0 0 44 44"
          >
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="4"
            />
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeDasharray={`${compatibility * 1.194} 119.4`}
              strokeLinecap="round"
            />
          </svg>
          <span>{compatibility}%</span>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-muted/55 p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-teach">
            Can teach you
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {teach.map((skill) => (
              <SkillTag key={skill} tone="teach">
                {skill}
              </SkillTag>
            ))}
          </div>
        </div>
        <div className="my-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          Skill exchange
          <span className="h-px flex-1 bg-border" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-learn">
            Wants to learn
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {learn.map((skill) => (
              <SkillTag key={skill} tone="learn">
                {skill}
              </SkillTag>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        <Sparkles size={13} className="mr-1 inline text-brand-accent" />{" "}
        Complementary goals and overlapping availability make this a strong
        two-way fit.
      </p>
      <div className="mt-5 flex gap-2">
        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <BookOpen size={16} />
          Generate plan
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl border">
          <MessageCircle size={17} />
        </div>
      </div>
    </article>
  );
}

function Matches() {
  return (
    <>
      <Header
        eyebrow="AI partner discovery"
        title="Matches built for a real skill swap"
        description="Every recommendation balances what you can teach, what you want to learn, availability, and learning style."
        action={
          <div className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            <Sparkles size={17} />
            Refresh AI matches
          </div>
        }
      />
      <section className="mb-4 grid items-center gap-4 rounded-2xl border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target size={19} />
          </span>
          <div>
            <p className="text-sm font-bold">
              Matching for: React & product design
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Based on 6 teaching skills, 4 learning goals, and evening
              availability
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SkillTag tone="teach">You teach TypeScript</SkillTag>
          <SkillTag tone="learn">You learn Design</SkillTag>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <MatchCard
          featured
          name="Maya Chen"
          subtitle="Senior Product Designer · London"
          compatibility={94}
          initials="MC"
          teach={["Product Design", "Figma"]}
          learn={["React", "TypeScript"]}
        />
        <MatchCard
          name="Alex Rivera"
          subtitle="Frontend Engineer · Madrid"
          compatibility={89}
          initials="AR"
          teach={["React", "Next.js"]}
          learn={["Node.js", "System Design"]}
        />
        <MatchCard
          name="Sofia Novak"
          subtitle="UX Researcher · Warsaw"
          compatibility={86}
          initials="SN"
          teach={["UX Research", "Prototyping"]}
          learn={["APIs", "JavaScript"]}
        />
      </section>
      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [Users, "24", "Relevant partners"],
          [Star, "94%", "Top compatibility"],
          [Calendar, "6", "Shared time slots"],
          [Lightbulb, "12", "AI insights"],
        ].map(([Icon, value, label]) => {
          const ItemIcon = Icon as typeof Users;
          return (
            <div
              key={label as string}
              className="min-w-0 items-center gap-3 rounded-2xl border bg-card p-4 sm:flex"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                <ItemIcon size={18} />
              </span>
              <div className="mt-2 min-w-0 sm:mt-0">
                <p className="text-xl font-bold">{value as string}</p>
                <p className="text-xs text-muted-foreground">
                  {label as string}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

function Plan() {
  const modules = [
    {
      number: "01",
      title: "Design foundations for developers",
      meta: "2 sessions · 4 resources",
      status: "Complete",
    },
    {
      number: "02",
      title: "From wireframe to component",
      meta: "3 sessions · practical project",
      status: "In progress",
    },
    {
      number: "03",
      title: "Design systems that scale",
      meta: "2 sessions · shared workshop",
      status: "Up next",
    },
    {
      number: "04",
      title: "Portfolio critique & handoff",
      meta: "1 session · final review",
      status: "Locked",
    },
  ];
  return (
    <>
      <Header
        eyebrow="AI-generated learning journey"
        title="React ↔ Product Design"
        description="A two-way learning plan designed for you and Maya, with clear milestones, shared sessions, and practical outcomes."
        action={
          <div className="rounded-xl border bg-card px-4 py-3 text-sm font-bold">
            8-week exchange
          </div>
        }
      />
      <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/10 p-7">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid min-w-0 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Sparkles size={17} />
              AI learning plan
            </div>
            <h2 className="mt-4 font-heading text-3xl font-bold">
              Build, teach, and ship together
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Maya helps you turn product thinking into polished interfaces. You
              help Maya build those interfaces with React and TypeScript.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <SkillTag tone="teach">You teach React</SkillTag>
              <SkillTag tone="learn">You learn Product Design</SkillTag>
            </div>
          </div>
          <div className="rounded-2xl border bg-card/90 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Overall progress
                </p>
                <p className="mt-1 text-2xl font-bold">38%</p>
              </div>
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[38%] rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              3 of 8 milestones complete
            </p>
          </div>
        </div>
      </section>
      <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold">
                Learning modules
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Personalized sequence from foundation to portfolio-ready work
              </p>
            </div>
            <BookOpen size={21} className="text-primary" />
          </div>
          <div className="space-y-2.5">
            {modules.map((item, index) => (
              <div
                key={item.number}
                className={cn(
                  "grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-xl border px-3 py-3.5 sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto] sm:gap-4 sm:px-4",
                  index === 1 && "border-primary/35 bg-primary/5"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl text-xs font-bold",
                    index < 2
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.number}
                </span>
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
                <span
                  className={cn(
                    "col-start-2 justify-self-start rounded-full px-3 py-1 text-xs font-bold sm:col-start-auto",
                    item.status === "In progress"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.status}
                </span>
                <ChevronRight
                  size={17}
                  className="hidden text-muted-foreground sm:block"
                />
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-heading text-lg font-bold">Next session</h2>
            <div className="mt-4 rounded-xl bg-muted/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Tomorrow · 18:30
              </p>
              <p className="mt-2 text-sm font-bold">Wireframe critique</p>
              <p className="mt-1 text-xs text-muted-foreground">
                45 min · Video call
              </p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
              <Video size={16} />
              Join session
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={16} className="text-brand-accent" />
              AI plan insight
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Your pace is 12% ahead. Module 3 will unlock after the next
              practical review.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary">
              View plan rationale <ArrowRight size={14} />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function Chat() {
  const messages = [
    {
      mine: false,
      text: "I reviewed your dashboard wireframes—the hierarchy is already much clearer.",
      time: "18:34",
    },
    {
      mine: true,
      text: "Great! I applied the spacing system we discussed. Want to review the component states next?",
      time: "18:36",
    },
    {
      mine: false,
      text: "Yes. I also pushed my React exercise. The filter state finally persists 🎉",
      time: "18:38",
    },
    {
      mine: true,
      text: "Nice work. I left two comments and a small TypeScript improvement.",
      time: "18:39",
    },
  ];
  return (
    <>
      <Header
        eyebrow="Real-time collaboration"
        title="Learning happens in the conversation"
        description="Chat, share progress, schedule sessions, and keep the AI learning plan connected to the work."
        action={
          <div className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            <Video size={17} />
            Start video session
          </div>
        }
      />
      <section className="grid min-h-[620px] min-w-0 grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_19rem]">
        <aside className="hidden border-r p-4 lg:block">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-heading text-lg font-bold">Messages</h2>
            <span className="flex size-8 items-center justify-center rounded-lg border">
              <MoreHorizontal size={17} />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
            <Search size={15} />
            Search conversations
          </div>
          <div className="mt-4 space-y-1">
            {[
              ["MC", "Maya Chen", "The filter state finally…", "Now", true],
              ["AR", "Alex Rivera", "See you on Thursday!", "2h", false],
              ["SN", "Sofia Novak", "Shared a resource", "1d", false],
            ].map(([initials, name, preview, time, active]) => (
              <div
                key={name as string}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-3",
                  active && "bg-primary/10"
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-teach-soft text-xs font-bold text-accent-teach">
                  {initials as string}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="truncate text-sm font-bold">
                      {name as string}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {time as string}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {preview as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex flex-col">
          <header className="flex items-center justify-between border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent-teach-soft font-bold text-accent-teach">
                MC
              </span>
              <div>
                <p className="text-sm font-bold">Maya Chen</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-success" />
                  Online · 94% match
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl border">
                <Search size={16} />
              </span>
              <span className="flex size-9 items-center justify-center rounded-xl border">
                <MoreHorizontal size={16} />
              </span>
            </div>
          </header>
          <div className="flex-1 space-y-4 bg-muted/25 p-4 sm:p-6">
            <div className="text-center">
              <span className="rounded-full bg-card px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Today
              </span>
            </div>
            {messages.map((message, index) => (
              <div
                key={message.text}
                className={cn("flex", message.mine && "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[72%]",
                    message.mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border bg-card"
                  )}
                >
                  <p>{message.text}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      message.mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {message.time}
                    {message.mine && index === 3 ? " · Read" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <footer className="border-t p-4">
            <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
              <span className="flex-1">Write a message…</span>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Send size={16} />
              </span>
            </div>
          </footer>
        </div>
        <aside className="hidden border-l p-5 xl:block">
          <div className="text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-teach-soft text-lg font-bold text-accent-teach">
              MC
            </span>
            <h2 className="mt-3 font-heading text-lg font-bold">Maya Chen</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Senior Product Designer
            </p>
          </div>
          <div className="mt-5 rounded-xl bg-muted/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Active learning plan
            </p>
            <p className="mt-2 text-sm font-bold">React ↔ Product Design</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
              <div className="h-full w-[38%] bg-primary" />
            </div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>38% complete</span>
              <span>Week 3</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold">Next session</h3>
            <div className="mt-2 rounded-xl border p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Calendar size={15} />
                Tomorrow
              </div>
              <p className="mt-2 text-sm font-bold">Wireframe critique</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 size={14} />
                18:30 · 45 min
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold">
            <Calendar size={16} />
            Schedule session
          </div>
        </aside>
      </section>
    </>
  );
}

export function SkillSwapShowcase({ screen }: { screen: SkillSwapScreen }) {
  return (
    <Shell screen={screen}>
      {screen === "matches" ? (
        <Matches />
      ) : screen === "plan" ? (
        <Plan />
      ) : (
        <Chat />
      )}
    </Shell>
  );
}
