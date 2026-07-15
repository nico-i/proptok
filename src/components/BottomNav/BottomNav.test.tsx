import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { BottomNav } from "./BottomNav";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>,
  );
}

describe("BottomNav", () => {
  it("links Home to the feed, Post to the camera, Profile to setup", () => {
    renderAt("/");
    expect(
      screen.getByRole("link", { name: "Home" }).getAttribute("href"),
    ).toBe("/");
    expect(
      screen.getByRole("link", { name: "Post" }).getAttribute("href"),
    ).toBe("/camera");
    expect(
      screen.getByRole("link", { name: "Profile" }).getAttribute("href"),
    ).toBe("/setup");
  });

  it("exposes Discover and Inbox as inert cosmetic buttons", () => {
    renderAt("/");
    expect(screen.getByRole("button", { name: "Discover" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Inbox" })).toBeDefined();
  });
});
