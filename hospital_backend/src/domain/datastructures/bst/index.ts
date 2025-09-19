export interface BSTNode<T> {
  key: number;
  value: T;
  left?: BSTNode<T> | null;
  right?: BSTNode<T> | null;
}

export class BST<T> {
  private root: BSTNode<T> | null = null;

  insert(key: number, value: T): void {
    const node: BSTNode<T> = { key, value, left: null, right: null };
    if (!this.root) {
      this.root = node;
      return;
    }
    let cur: BSTNode<T> | null = this.root;
    while (cur) {
      if (key < cur.key) {
        if (!cur.left) { cur.left = node; return; }
        cur = cur.left;
      } else if (key > cur.key) {
        if (!cur.right) { cur.right = node; return; }
        cur = cur.right;
      } else {
        // clave existente: actualiza valor
        cur.value = value;
        return;
      }
    }
  }

  find(key: number): T | undefined {
    let cur = this.root;
    while (cur) {
      if (key < cur.key) cur = cur.left ?? null;
      else if (key > cur.key) cur = cur.right ?? null;
      else return cur.value;
    }
    return undefined;
  }

  remove(key: number): boolean {
    const res = this.removeNode(this.root, key);
    this.root = res.node;
    return res.removed;
  }

  private removeNode(node: BSTNode<T> | null, key: number): { node: BSTNode<T> | null; removed: boolean } {
    if (!node) return { node: null, removed: false };

    if (key < node.key) {
      const r = this.removeNode(node.left ?? null, key);
      node.left = r.node;
      return { node, removed: r.removed };
    } else if (key > node.key) {
      // 🔧 FIX: usar this.removeNode (antes decía self.removeNode)
      const r = this.removeNode(node.right ?? null, key);
      node.right = r.node;
      return { node, removed: r.removed };
    } else {
      // encontrado
      // Caso 1: sin hijos
      if (!node.left && !node.right) {
        return { node: null, removed: true };
      }
      // Caso 2: un hijo
      if (!node.left) return { node: node.right ?? null, removed: true };
      if (!node.right) return { node: node.left ?? null, removed: true };

      // Caso 3: dos hijos → usar sucesor inorder (mínimo del subárbol derecho)
      let succParent = node;
      let succ = node.right!;
      while (succ.left) {
        succParent = succ;
        succ = succ.left;
      }
      // copiar clave/valor del sucesor
      node.key = succ.key;
      node.value = succ.value;
      // eliminar sucesor del subárbol derecho
      if (succParent.left === succ) {
        succParent.left = succ.right ?? null;
      } else {
        succParent.right = succ.right ?? null;
      }
      return { node, removed: true };
    }
  }

  inOrder(): Array<{ key: number; value: T }> {
    const res: Array<{ key: number; value: T }> = [];
    const traverse = (n: BSTNode<T> | null) => {
      if (!n) return;
      traverse(n.left ?? null);
      res.push({ key: n.key, value: n.value });
      traverse(n.right ?? null);
    };
    traverse(this.root);
    return res;
  }
}
