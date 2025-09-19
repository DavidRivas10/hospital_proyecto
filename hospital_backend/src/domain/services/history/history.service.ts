import { LinkedList } from "../../datastructures/linked-list/index.js";
import type { Urgencia } from "../../models/ticket.js";

export type HistoryItem = {
  id: string;
  patientId: string;
  urgencia: Urgencia;
  llegadaAt: string;
  startedAt?: string;
  finishedAt?: string;
};

export class HistoryService {
  private list = new LinkedList<HistoryItem>();
  private maxItems: number;

  constructor(maxItems = 500) {
    this.maxItems = maxItems;
  }

  // Agrega y recorta si excede el límite
  add(item: HistoryItem) {
    this.list.append(item);
    while (this.size() > this.maxItems) {
      this.trimHead();
    }
  }

  size() {
    return this.list.size();
  }

  toArray(): HistoryItem[] {
    const arr: HistoryItem[] = [];
    for (const it of this.list) arr.push(it);
    return arr;
  }

  clear() {
    this.list = new LinkedList<HistoryItem>();
  }

  // Quita el primer elemento de la lista recreándola (sin depender de métodos internos)
  private trimHead() {
    const newList = new LinkedList<HistoryItem>();
    let skipped = false;
    for (const it of this.list) {
      if (!skipped) { skipped = true; continue; }
      newList.append(it);
    }
    this.list = newList;
  }
}
