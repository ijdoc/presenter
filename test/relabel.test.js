// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createRelabel } from "../src/lib/relabel.js";

const relabel = createRelabel({ selector: ".status", from: "completed", to: "Stopped", className: "is-ended" });

describe("createRelabel", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <span class="status green"><i class="icon"></i> Completed </span>
      <span class="status">running</span>
      <span class="other">completed</span>`;
  });

  it("relabels only matching elements with matching text", () => {
    relabel.apply(document);
    const [ended, running] = document.querySelectorAll(".status");
    expect(ended.textContent).toBe("Stopped");
    expect(ended.classList.contains("is-ended")).toBe(true);
    expect(running.textContent).toBe("running");
    expect(document.querySelector(".other").textContent).toBe("completed");
  });

  it("restores the page exactly, child nodes included", () => {
    const original = document.body.innerHTML;
    const icon = document.querySelector(".icon");
    relabel.apply(document);
    relabel.revert(document);
    expect(document.body.innerHTML).toBe(original);
    expect(document.querySelector(".icon")).toBe(icon);
  });

  it("is idempotent", () => {
    relabel.apply(document);
    const once = document.body.innerHTML;
    relabel.apply(document);
    expect(document.body.innerHTML).toBe(once);
  });

  it("does not remove a class the page already had", () => {
    document.body.innerHTML = `<span class="status is-ended">completed</span>`;
    const original = document.body.innerHTML;
    relabel.apply(document);
    relabel.revert(document);
    expect(document.body.innerHTML).toBe(original);
  });

  it("relabels again when the page writes over our text in place", () => {
    relabel.apply(document);
    const ended = document.querySelector(".status");
    ended.textContent = "completed";
    relabel.apply(document);
    expect(ended.textContent).toBe("Stopped");
  });
});
