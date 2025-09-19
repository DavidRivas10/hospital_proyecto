import { describe, it, expect } from "vitest";
import { BST } from "../../src/domain/datastructures/bst/index.js";

describe("BST", () => {
  it("insert/find e inOrder", () => {
    const bst = new BST<string>();
    bst.insert(50, "A");
    bst.insert(30, "B");
    bst.insert(70, "C");
    bst.insert(20, "D");
    bst.insert(40, "E");
    bst.insert(60, "F");
    bst.insert(80, "G");

    expect(bst.find(60)).toBe("F");
    expect(bst.find(25)).toBeUndefined();

    const ordered = bst.inOrder().map((x) => x.key);
    expect(ordered).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  it("remove: hoja, un hijo, dos hijos", () => {
    const bst = new BST<string>();
    [50, 30, 70, 20, 40, 60, 80].forEach((k) => bst.insert(k, String(k)));

    // hoja
    expect(bst.remove(20)).toBe(true);
    expect(bst.find(20)).toBeUndefined();

    // un hijo (40 tiene ninguno, 30 tiene un hijo tras quitar 20)
    expect(bst.remove(30)).toBe(true);
    expect(bst.find(30)).toBeUndefined();

    // dos hijos (50 tiene 40? ya no, pero tiene 70 con 60 y 80 => dos hijos)
    expect(bst.remove(50)).toBe(true);
    expect(bst.find(50)).toBeUndefined();

    const ordered = bst.inOrder().map((x) => x.key);
    // debería seguir estando ordenado y sin las claves removidas
    expect(ordered).toEqual([40, 60, 70, 80]);
  });

  it("insert sobre clave existente actualiza valor", () => {
    const bst = new BST<string>();
    bst.insert(10, "A");
    bst.insert(10, "A2");
    expect(bst.find(10)).toBe("A2");
  });
});
