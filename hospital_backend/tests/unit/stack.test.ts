import { describe, it, expect } from "vitest";
import { Stack } from "../../src/domain/datastructures/stack/index.js";

describe("Stack", () => {
  it("push/pop/peek/size/isEmpty", () => {
    const s = new Stack<string>();
    expect(s.isEmpty()).toBe(true);
    expect(s.size()).toBe(0);
    expect(s.peek()).toBeUndefined();
    expect(s.pop()).toBeUndefined();

    s.push("Ana");
    s.push("Beto");
    s.push("Carla");
    expect(s.isEmpty()).toBe(false);
    expect(s.size()).toBe(3);
    expect(s.peek()).toBe("Carla");

    expect(s.pop()).toBe("Carla");
    expect(s.peek()).toBe("Beto");
    expect(s.size()).toBe(2);
    expect(s.toArray()).toEqual(["Ana", "Beto"]);
  });
});
