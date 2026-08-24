import { HOW_IT_WORKS_STEPS } from "@/components/marketing/content";

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="font-heading flex size-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
        {step}
      </span>
      <h3 className="font-heading text-h3">{title}</h3>
      <p className="text-muted-foreground text-body-sm">{description}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <ol className="grid gap-8 md:grid-cols-3">
      {HOW_IT_WORKS_STEPS.map(({ title, description }, index) => (
        <li key={title}>
          <StepCard step={index + 1} title={title} description={description} />
        </li>
      ))}
    </ol>
  );
}
