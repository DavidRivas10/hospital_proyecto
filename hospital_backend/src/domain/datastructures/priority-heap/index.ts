export type Urgency = 1 | 2 | 3;

export type PriorityKey = {
  urgency: Urgency;      // 1 es mayor prioridad
  arrivalSeq: number;    // FIFO dentro del mismo nivel
};

export interface HeapItem<T> {
  key: PriorityKey;
  value: T;
}

export interface PriorityMinHeap<T> {
  size(): number;
  peek(): HeapItem<T> | undefined;
  insert(item: HeapItem<T>): void;
  extractMin(): HeapItem<T> | undefined;
  updateKey(
    predicate: (v: T) => boolean,
    newKey: PriorityKey,
    mutateValue?: (v: T) => T
  ): boolean;
  toArray(): HeapItem<T>[];
}

function isHigherPriority(a: PriorityKey, b: PriorityKey): boolean {
  if (a.urgency !== b.urgency) return a.urgency < b.urgency;
  return a.arrivalSeq < b.arrivalSeq;
}

export class PriorityMinHeapImpl<T> implements PriorityMinHeap<T> {
  private data: HeapItem<T>[] = [];

  size(): number { return this.data.length; }
  peek(): HeapItem<T> | undefined { return this.data[0]; }

  insert(item: HeapItem<T>): void {
    this.data.push(item);
    this.heapifyUp(this.data.length - 1);
  }

  extractMin(): HeapItem<T> | undefined {
    const n = this.data.length;
    if (n === 0) return undefined;
    if (n === 1) return this.data.pop();
    const min = this.data[0];
    this.data[0] = this.data[n - 1];
    this.data.pop();
    this.heapifyDown(0);
    return min;
  }

  updateKey(
  predicate: (v: T) => boolean,
  newKey: PriorityKey,
  mutateValue?: (v: T) => T
): boolean {
  const idx = this.data.findIndex((it) => predicate(it.value));
  if (idx === -1) return false;

  const oldKey = this.data[idx].key;
  this.data[idx].key = newKey;

  if (mutateValue) {
    this.data[idx].value = mutateValue(this.data[idx].value);
  }

  // Si la nueva clave es "menor" (más prioritaria) que la anterior, sube; si no, baja.
  if (isHigherPriority(newKey, oldKey)) {
    this.heapifyUp(idx);
  } else {
    this.heapifyDown(idx);
  }
  return true;
}


  toArray(): HeapItem<T>[] { return [...this.data]; }

  private parent(i: number) { return Math.floor((i - 1) / 2); }
  private left(i: number) { return i * 2 + 1; }
  private right(i: number) { return i * 2 + 2; }

  private heapifyUp(i: number): void {
    let idx = i;
    while (idx > 0) {
      const p = this.parent(idx);
      if (isHigherPriority(this.data[idx].key, this.data[p].key)) {
        this.swap(idx, p);
        idx = p;
      } else break;
    }
  }

  private heapifyDown(i: number): void {
    let idx = i;
    const n = this.data.length;
    while (true) {
      const l = this.left(idx);
      const r = this.right(idx);
      let smallest = idx;

      if (l < n && isHigherPriority(this.data[l].key, this.data[smallest].key)) {
        smallest = l;
      }
      if (r < n && isHigherPriority(this.data[r].key, this.data[smallest].key)) {
        smallest = r;
      }
      if (smallest !== idx) {
        this.swap(idx, smallest);
        idx = smallest;
      } else break;
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.data[a];
    this.data[a] = this.data[b];
    this.data[b] = tmp;
  }
}
