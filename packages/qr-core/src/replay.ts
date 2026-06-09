interface ReplayEntry {
  jti: string;
  exp: number;
}

export class JtiReplaySet {
  private entries = new Map<string, ReplayEntry>();

  constructor(private readonly maxSize: number = 10_000) {}

  has(jti: string): boolean {
    this.prune();
    return this.entries.has(jti);
  }

  add(jti: string, exp: number): void {
    this.prune();
    this.entries.set(jti, { jti, exp });
    if (this.entries.size > this.maxSize) {
      const oldest = this.entries.keys().next().value;
      if (oldest) this.entries.delete(oldest);
    }
  }

  prune(now: number = Math.floor(Date.now() / 1000)): void {
    for (const [jti, entry] of this.entries) {
      if (entry.exp < now) this.entries.delete(jti);
    }
  }

  size(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }
}
