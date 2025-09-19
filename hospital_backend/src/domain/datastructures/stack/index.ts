export class Stack<T> {
  private arr: T[] = [];

  push(v: T): void {
    this.arr.push(v);
  }

  pop(): T | undefined {
    return this.arr.pop();
  }

  peek(): T | undefined {
    return this.arr[this.arr.length - 1];
  }

  size(): number {
    return this.arr.length;
  }

  isEmpty(): boolean {
    return this.arr.length === 0;
  }

  toArray(): T[] {
    return [...this.arr];
  }
}
