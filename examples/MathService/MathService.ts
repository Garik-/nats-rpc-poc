export interface MathServiceImp {
  sum: (a: number, b: number) => number
}

export class MathService implements MathServiceImp {
  public sum(a: number, b: number): number {
    return a + b
  }
}
