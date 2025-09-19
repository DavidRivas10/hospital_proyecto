import { PriorityMinHeapImpl, type PriorityKey } from "../../datastructures/priority-heap/index.js";
import type { TriageTicket, Urgencia } from "../../models/ticket.js";

export class QueueService {
  private heap = new PriorityMinHeapImpl<TriageTicket>();
  private arrivalSeqCounter = 0;

  get size() { return this.heap.size(); }

  // Sembrar tickets waiting en memoria al arrancar (desde DB)
  seed(items: TriageTicket[]): void {
    this.heap = new PriorityMinHeapImpl<TriageTicket>();
    let maxSeq = 0;
    for (const t of items) {
      const key: PriorityKey = { urgency: t.urgencia as 1 | 2 | 3, arrivalSeq: t.arrivalSeq };
      this.heap.insert({ key, value: t });
      if (t.arrivalSeq > maxSeq) maxSeq = t.arrivalSeq;
    }
    this.arrivalSeqCounter = maxSeq;
  }

  // Wrapper para tests / uso en memoria (genera un ID efímero)
  enqueue(input: Omit<TriageTicket, "id" | "arrivalSeq" | "llegadaAt" | "estado"> & { urgencia: Urgencia }): TriageTicket {
    const id = `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return this.enqueueWithId(id, input);
  }

  // Para crear tickets desde API con ID externo (Mongo _id)
  enqueueWithId(id: string, input: Omit<TriageTicket, "id" | "arrivalSeq" | "llegadaAt" | "estado"> & { urgencia: Urgencia }): TriageTicket {
    const ticket: TriageTicket = {
      id,
      patientId: input.patientId,
      sintomas: input.sintomas,
      signosVitales: input.signosVitales,
      urgencia: input.urgencia,
      llegadaAt: new Date().toISOString(),
      arrivalSeq: ++this.arrivalSeqCounter,
      estado: "waiting",
    };
    const key: PriorityKey = { urgency: ticket.urgencia as 1 | 2 | 3, arrivalSeq: ticket.arrivalSeq };
    this.heap.insert({ key, value: ticket });
    return ticket;
  }

  peek(): TriageTicket | undefined {
    return this.heap.peek()?.value;
  }

  next(): TriageTicket | undefined {
    const min = this.heap.extractMin();
    if (!min) return undefined;
    const t = { ...min.value, estado: "in_service" as const };
    return t;
  }

  reprioritize(ticketId: string, nueva: Urgencia): boolean {
    const newSeq = ++this.arrivalSeqCounter;
    return this.heap.updateKey(
      (t) => t.id === ticketId,
      { urgency: nueva as 1 | 2 | 3, arrivalSeq: newSeq },
      (t) => ({ ...t, urgencia: nueva, arrivalSeq: newSeq })
    );
  }

  snapshot(): Array<Pick<TriageTicket, "id" | "patientId" | "urgencia" | "arrivalSeq">> {
    return this.heap.toArray().map(({ value }) => ({
      id: value.id,
      patientId: value.patientId,
      urgencia: value.urgencia,
      arrivalSeq: value.arrivalSeq,
    }));
  }

  clear(): void {
    this.heap = new (this.heap.constructor as any)();
    this.arrivalSeqCounter = 0;
  }
}
