import { SUPPORTING_FEATURES } from "@/components/marketing/content";
import { Reveal } from "@/components/marketing/Reveal";

/**
 * The supporting capabilities, deliberately given a lighter treatment than the
 * feature rows above: these are table stakes, not the reason to sign up, so
 * they read as a strip rather than three headline cards.
 */
export function FeatureGrid() {
  return (
    <ul className="grid gap-8 sm:grid-cols-3">
      {SUPPORTING_FEATURES.map(({ icon: Icon, title, description }, index) => (
        <li key={title}>
          <Reveal delay={index * 90} className="flex flex-col gap-2">
            <Icon className="text-primary size-5" aria-hidden />
            <p className="font-heading font-semibold">{title}</p>
            <p className="text-muted-foreground text-body-sm">{description}</p>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
