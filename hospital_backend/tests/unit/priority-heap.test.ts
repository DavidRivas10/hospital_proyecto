import { describe, it, expect } from "vitest";
import {
  PriorityMinHeapImpl,
  type PriorityKey,
  type HeapItem,
} from "../../src/domain/datastructures/priority-heap/index.js";

type Ticket = { id: string; name: string };

function item(id: string, name: string, key: PriorityKey): HeapItem<Ticket> {
  return { value: { id, name }, key };
}

describe("PriorityMinHeap", () => {
  it("inserta y extrae respetando urgencia (1 alta) y luego FIFO por arrivalSeq", () => {
    const heap = new PriorityMinHeapImpl<Ticket>();
    // arrivalSeq más pequeño = llegó antes
    heap.insert(item("a", "Ana",   { urgency: 2, arrivalSeq: 1 }));
    heap.insert(item("b", "Beto",  { urgency: 1, arrivalSeq: 2 })); // más urgente
    heap.insert(item("c", "Carla", { urgency: 1, arrivalSeq: 3 })); // misma urgencia que b, llegó después
    heap.insert(item("d", "Dani",  { urgency: 3, arrivalSeq: 4 }));

    // Orden esperado: b (u1,seq2), c (u1,seq3), a (u2,seq1), d (u3,seq4)
    expect(heap.size()).toBe(4);

    const out1 = heap.extractMin()!;
    expect(out1.value.name).toBe("Beto");

    const out2 = heap.extractMin()!;
    expect(out2.value.name).toBe("Carla");

    const out3 = heap.extractMin()!;
    expect(out3.value.name).toBe("Ana");

    const out4 = heap.extractMin()!;
    expect(out4.value.name).toBe("Dani");

    expect(heap.size()).toBe(0);
    expect(heap.extractMin()).toBeUndefined();
  });

  it("peek no extrae", () => {
    const heap = new PriorityMinHeapImpl<Ticket>();
    heap.insert(item("x", "Xime", { urgency: 2, arrivalSeq: 1 }));
    const p = heap.peek();
    expect(p?.value.name).toBe("Xime");
    expect(heap.size()).toBe(1);
  });

  it("updateKey reubica por mayor urgencia", () => {
    const heap = new PriorityMinHeapImpl<Ticket>();
    heap.insert(item("p1", "Pedro", { urgency: 3, arrivalSeq: 10 })); // baja prioridad
    heap.insert(item("s1", "Sara",  { urgency: 2, arrivalSeq: 11 }));
    heap.insert(item("l1", "Luz",   { urgency: 2, arrivalSeq: 12 }));

    // Pedro empeora: pasa a urgencia 1
    const ok = heap.updateKey((v) => v.id === "p1", { urgency: 1, arrivalSeq: 13 });
    expect(ok).toBe(true);

    // Debe salir primero Pedro ahora
    const next = heap.extractMin()!;
    expect(next.value.name).toBe("Pedro");

    // Luego deben salir Sara y Luz (ambas u2; FIFO por arrivalSeq)
    const s2 = heap.extractMin()!;
    const s3 = heap.extractMin()!;
    expect([s2.value.name, s3.value.name]).toEqual(["Sara", "Luz"]);
  });

  it("updateKey devuelve false si no encuentra coincidencia", () => {
    const heap = new PriorityMinHeapImpl<Ticket>();
    heap.insert(item("a", "Ana", { urgency: 2, arrivalSeq: 1 }));
    const ok = heap.updateKey((v) => v.id === "no-existe", { urgency: 1, arrivalSeq: 99 });
    expect(ok).toBe(false);
    // Ana sigue arriba
    expect(heap.peek()!.value.name).toBe("Ana");
  });
});
