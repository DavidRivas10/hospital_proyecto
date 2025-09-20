// src/domain/services/queue/queue.service.ts
import { randomUUID } from "node:crypto";

export type Ticket = {
  id: string;
  patientId: string;
  sintomas?: string;
  urgencia: number;      // 1 = más urgente
  arrivalSeq: number;    // FIFO dentro de la misma urgencia
  enqueuedAt: number;    // timestamp ms
};

type EnqueueDTO = {
  patientId: string;
  sintomas?: string;
  urgencia: number;
};

export type Attended = {
  id: string;
  patientId: string;
  urgencia: number;
  enqueuedAt: number;
  attendedAt: number;
  waitedMs: number;
};

export type HistoryEvent =
  | { type: "created"; at: number; ticket: Ticket }
  | { type: "attended"; at: number; attended: Attended };

export class QueueService {
  private items: Ticket[] = [];
  private attended: Attended[] = [];
  private events: HistoryEvent[] = [];
  private seq = 0;

  get size() {
    return this.items.length;
  }

  enqueue(dto: EnqueueDTO): Ticket {
    const t: Ticket = {
      id: randomUUID(),
      patientId: dto.patientId,
      sintomas: dto.sintomas ?? "",
      urgencia: dto.urgencia,
      arrivalSeq: ++this.seq,
      enqueuedAt: Date.now(),
    };
    this.items.push(t);
    // ⬇️ Log en historial
    this.events.push({ type: "created", at: t.enqueuedAt, ticket: t });
    return t;
  }

  peek(): Ticket | undefined {
    if (this.items.length === 0) return undefined;
    let best = this.items[0];
    for (let i = 1; i < this.items.length; i++) {
      const cur = this.items[i];
      if (this.better(cur, best)) best = cur;
    }
    return best;
  }

  next(): Ticket | undefined {
    if (this.items.length === 0) return undefined;
    let bestIdx = 0;
    for (let i = 1; i < this.items.length; i++) {
      if (this.better(this.items[i], this.items[bestIdx])) bestIdx = i;
    }
    const [picked] = this.items.splice(bestIdx, 1);
    return picked;
  }

  attend(id: string): Attended | null {
    const idx = this.items.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    const [t] = this.items.splice(idx, 1);
    const attendedAt = Date.now();
    const waitedMs = Math.max(0, attendedAt - (t.enqueuedAt ?? attendedAt));
    const record: Attended = {
      id: t.id,
      patientId: t.patientId,
      urgencia: t.urgencia,
      enqueuedAt: t.enqueuedAt,
      attendedAt,
      waitedMs,
    };
    this.attended.push(record);
    // ⬇️ Log en historial
    this.events.push({ type: "attended", at: attendedAt, attended: record });
    return record;
  }

  reprioritize(id: string, newUrgency: number): boolean {
    const t = this.items.find((x) => x.id === id);
    if (!t) return false;
    t.urgencia = newUrgency;
    const sameUrgency = this.items.filter(
      (x) => x.id !== id && x.urgencia === newUrgency
    );
    if (sameUrgency.length > 0) {
      const maxSeq = Math.max(...sameUrgency.map((x) => x.arrivalSeq));
      t.arrivalSeq = maxSeq + 1;
    }
    return true;
  }

  snapshot(): Ticket[] {
    return [...this.items].sort((a, b) => {
      if (a.urgencia !== b.urgencia) return a.urgencia - b.urgencia;
      return a.arrivalSeq - b.arrivalSeq;
    });
  }

  /** Historial (creados + atendidos), más reciente primero */
  history(limit = 500): HistoryEvent[] {
    const list = [...this.events].sort((a, b) => b.at - a.at);
    return list.slice(0, Math.max(1, limit));
  }

  metricsToday() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;

    const today = this.attended.filter(a => a.attendedAt >= start && a.attendedAt < end);
    const todayCompleted = today.length;
    const avgMinutes =
      todayCompleted > 0
        ? Math.round((today.reduce((sum, a) => sum + a.waitedMs, 0) / todayCompleted) / 60000)
        : null;

    return { pendingCount: this.size, todayCompleted, avgMinutes };
  }

  reset() {
    this.items = [];
    this.attended = [];
    this.events = [];
    this.seq = 0;
  }

  private better(a: Ticket, b: Ticket): boolean {
    if (a.urgencia !== b.urgencia) return a.urgencia < b.urgencia;
    return a.arrivalSeq < b.arrivalSeq;
  }
}
