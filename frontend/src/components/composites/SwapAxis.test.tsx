import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SwapAxis } from "./SwapAxis";

describe("SwapAxis", () => {
  it("renders teach before learn in DOM order", () => {
    const { container } = render(
      <SwapAxis teach={[{ title: "React" }]} learn={[{ title: "Python" }]} />
    );

    const text = container.textContent ?? "";
    expect(text.indexOf("React")).toBeGreaterThanOrEqual(0);
    expect(text.indexOf("Python")).toBeGreaterThan(text.indexOf("React"));
  });

  it("maps variant=learn to the learn token class, not teach", () => {
    render(
      <SwapAxis teach={[{ title: "React" }]} learn={[{ title: "Python" }]} />
    );

    const learnPill = screen.getByText("Python");
    expect(learnPill.className).toContain("text-accent-learn");
    expect(learnPill.className).not.toContain("text-accent-teach");

    const teachPill = screen.getByText("React");
    expect(teachPill.className).toContain("text-accent-teach");
    expect(teachPill.className).not.toContain("text-accent-learn");
  });

  it("renders an overflow +N badge past max", () => {
    render(
      <SwapAxis
        teach={[
          { title: "React" },
          { title: "TypeScript" },
          { title: "Node.js" },
        ]}
        learn={[{ title: "Python" }]}
        max={2}
      />
    );

    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
