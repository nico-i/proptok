import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadTake, saveTakeToDevice, toTakeFile } from "./share";

const file = () => toTakeFile(new Blob(["x"], { type: "video/mp4" }), 0);

describe("downloadTake", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("does not revoke the object URL before the browser processes the click", () => {
    const clicked = vi.fn();
    const anchor = document.createElement("a");
    anchor.click = clicked;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.useFakeTimers();

    downloadTake(file());

    expect(clicked).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
  });
});

describe("saveTakeToDevice", () => {
  const stubDesktop = (isDesktop: boolean) =>
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: isDesktop })),
    );

  afterEach(() => vi.unstubAllGlobals());

  it("downloads directly on desktop instead of invoking Web Share", async () => {
    stubDesktop(true);
    const share = vi.fn();
    vi.stubGlobal("navigator", { share, canShare: () => true });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    const anchor = document.createElement("a");
    const click = vi.fn();
    anchor.click = click;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    const ok = await saveTakeToDevice(file());
    await new Promise((r) => setTimeout(r, 0));

    expect(ok).toBe(true);
    expect(click).toHaveBeenCalledOnce();
    expect(share).not.toHaveBeenCalled();
  });

  it("falls back to a download when file sharing is unsupported", async () => {
    stubDesktop(false);
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    const anchor = document.createElement("a");
    const click = vi.fn();
    anchor.click = click;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    const ok = await saveTakeToDevice(file());
    await new Promise((r) => setTimeout(r, 0));

    expect(ok).toBe(true);
    expect(click).toHaveBeenCalledOnce();
  });

  it("reports success when the share sheet completes", async () => {
    stubDesktop(false);
    vi.stubGlobal("navigator", {
      share: vi.fn().mockResolvedValue(undefined),
      canShare: vi.fn(() => true),
    });
    expect(await saveTakeToDevice(file())).toBe(true);
  });

  it("reports failure when the user cancels the share sheet", async () => {
    stubDesktop(false);
    vi.stubGlobal("navigator", {
      share: vi.fn().mockRejectedValue(new DOMException("x", "AbortError")),
      canShare: vi.fn(() => true),
    });
    expect(await saveTakeToDevice(file())).toBe(false);
  });
});
