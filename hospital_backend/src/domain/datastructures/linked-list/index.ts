// Lista enlazada simple con acceso rápido a head/tail.
// Uso: historial de pacientes atendidos.

export interface LLNode<T> {
  value: T;
  next?: LLNode<T> | null;
}

export class LinkedList<T> {
  private head: LLNode<T> | null = null;
  private tail: LLNode<T> | null = null;
  private _size = 0;

  size(): number {
    return this._size;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  // Inserta al final
  append(value: T): void {
    const node: LLNode<T> = { value, next: null };
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      if (this.tail) this.tail.next = node;
      this.tail = node;
    }
    this._size++;
  }

  // Devuelve un array con todos los valores
  toArray(): T[] {
    const arr: T[] = [];
    let current = this.head;
    while (current) {
      arr.push(current.value);
      current = current.next ?? null;
    }
    return arr;
  }

  // Iterador (para usar en for..of)
  *[Symbol.iterator](): IterableIterator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next ?? null;
    }
  }
}
