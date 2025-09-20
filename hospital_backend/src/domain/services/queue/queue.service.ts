// src/domain/services/queue/queue.service.ts
import { randomUUID } from "node:crypto";

export type Ticket = {
  id: string;
  patientId: string;
  sintomas?: string;
  urgencia: number;      // 1 = más urgente
  arrivalSeq: number;    // FIFO dentro de la misma urgencia
  enqueuedAt: number;    // timestamp ms para métricas
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

export class QueueService {
  private items: Ticket[] = [];
  private attended: Attended[] = [];
  private seq = 0;

  /** Número de elementos en cola */
  get size() {
    return this.items.length;
  }

  /** Inserta y devuelve el ticket creado */
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
    return t;
  }

  /** Mira el siguiente (por urgencia asc y arrivalSeq asc) sin extraer */
  peek(): Ticket | undefined {
    if (this.items.length === 0) return undefined;
    let best = this.items[0];
    for (let i = 1; i < this.items.length; i++) {
      const cur = this.items[i];
      if (this.better(cur, best)) best = cur;
    }
    return best;
  }

  /** Extrae el siguiente según prioridad clínica + FIFO */
  next(): Ticket | undefined {
    if (this.items.length === 0) return undefined;
    // encuentra índice del "mejor"
    let bestIdx = 0;
    for (let i = 1; i < this.items.length; i++) {
      if (this.better(this.items[i], this.items[bestIdx])) bestIdx = i;
    }
    const [picked] = this.items.splice(bestIdx, 1);
    return picked;
  }

  /** Marca un ticket como atendido (lo saca de la cola por id) y lo registra para métricas */
  attend(id: string): Attended | null {
    const idx = this.items.findIndex(x => x.id === id);
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
    return record;
  }

  /** Reprioriza: mueve el ticket al **final** dentro de su nueva urgencia (respeta FIFO existente) */
  reprioritize(id: string, newUrgency: number): boolean {
    const t = this.items.find(x => x.id === id);
    if (!t) return false;

    // Actualiza la urgencia
    t.urgencia = newUrgency;

    // Los tests esperan que el repriorizado quede DETRÁS de los que ya tenían esa urgencia.
    const sameUrgency = this.items.filter(x => x.id !== id && x.urgencia === newUrgency);
    if (sameUrgency.length > 0) {
      const maxSeq = Math.max(...sameUrgency.map(x => x.arrivalSeq));
      t.arrivalSeq = maxSeq + 1;
    }
    return true;
  }

  /** Snapshot ordenado (sólo lectura) */
  snapshot(): Ticket[] {
    return [...this.items].sort((a, b) => {
      if (a.urgencia !== b.urgencia) return a.urgencia - b.urgencia;
      return a.arrivalSeq - b.arrivalSeq;
    });
  }

  /** Métricas de hoy (UTC-agnóstico: usa la fecha local del servidor) */
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

    return {
      pendingCount: this.size,
      todayCompleted,
      avgMinutes,
    };
  }

  /** Vacía la cola (para tests) */
  reset() {
    this.items = [];
    this.attended = [];
    this.seq = 0;
  }

  /** Comparador: true si a es mejor (más urgente/FIFO) que b */
  private better(a: Ticket, b: Ticket): boolean {
    if (a.urgencia !== b.urgencia) return a.urgencia < b.urgencia;
    return a.arrivalSeq < b.arrivalSeq;
  }
}
