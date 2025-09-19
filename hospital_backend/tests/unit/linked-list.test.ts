import { describe, it, expect } from "vitest";
import { LinkedList } from "../../src/domain/datastructures/linked-list/index.js";

describe("LinkedList", () => {
  it("empieza vacía", () => {
    const list = new LinkedList<string>();
    expect(list.size()).toBe(0);
    expect(list.isEmpty()).toBe(true);
    expect(list.toArray()).toEqual([]);
  });

  it("append agrega al final y aumenta el tamaño", () => {
    const list = new LinkedList<number>();
    list.append(10);
    list.append(20);
    list.append(30);
    expect(list.size()).toBe(3);
    expect(list.isEmpty()).toBe(false);
    expect(list.toArray()).toEqual([10, 20, 30]);
  });

  it("soporta iteración con for..of", () => {
    const list = new LinkedList<string>();
    list.append("Ana");
    list.append("Beto");
    list.append("Carla");

    const values: string[] = [];
    for (const v of list) values.push(v);

    expect(values).toEqual(["Ana", "Beto", "Carla"]);
  });
});
