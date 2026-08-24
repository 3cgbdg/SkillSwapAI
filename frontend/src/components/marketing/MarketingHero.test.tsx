import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { MarketingHero } from "./MarketingHero";
import { SITE_SUBHEADLINE, SITE_TAGLINE } from "./content";

describe("MarketingHero", () => {
  it("renders the shared tagline and subheadline from content.ts", () => {
    render(<MarketingHero />);

    // Locks the shared-copy contract: editing content.ts must not silently
    // stop the hero (or the auth split-pane) from showing this copy.
    expect(
      screen.getByRole("heading", { level: 1, name: SITE_TAGLINE })
    ).toBeInTheDocument();
    expect(screen.getByText(SITE_SUBHEADLINE)).toBeInTheDocument();
  });

  it("points both calls to action at the auth routes", () => {
    render(<MarketingHero />);

    expect(
      screen.getByRole("link", { name: /create your free account/i })
    ).toHaveAttribute("href", "/auth/signup");
    expect(screen.getByRole("link", { name: /^log in$/i })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });
});
