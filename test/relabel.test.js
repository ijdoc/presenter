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
    expect(ended.textContent.trim()).toBe("Stopped");
    expect(ended.classList.contains("is-ended")).toBe(true);
    expect(ended.querySelector(".icon")).not.toBeNull();
    expect(running.textContent).toBe("running");
    expect(document.querySelector(".other").textContent).toBe("completed");
  });

  it("restores the page exactly, keeping the same nodes", () => {
    const original = document.body.innerHTML;
    const ended = document.querySelector(".status");
    const nodes = [...ended.childNodes];
    relabel.apply(document);
    expect([...ended.childNodes]).toEqual(nodes);
    relabel.revert(document);
    expect(document.body.innerHTML).toBe(original);
    expect([...ended.childNodes]).toEqual(nodes);
  });

  it("leaves an element alone when its text is nested deeper", () => {
    document.body.innerHTML = `<span class="status"><b>completed</b></span>`;
    const original = document.body.innerHTML;
    relabel.apply(document);
    expect(document.body.innerHTML).toBe(original);
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
    ended.lastChild.data = "Completed";
    relabel.apply(document);
    expect(ended.textContent.trim()).toBe("Stopped");
  });
});
