import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-border bg-muted/40 mt-auto border-t">
      <div className="_container flex flex-wrap items-center justify-between gap-4 py-6 text-sm">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} SkillSwap AI
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/matches"
            className="text-muted-foreground hover:text-primary"
          >
            Matches
          </Link>
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-primary"
          >
            Profile
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
