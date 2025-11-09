import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Modelo de un cuerpo en la simulación */
export interface Body {
  id: string;
  name: string;
  m: number;     // masa
  r: number;     // radio visual (px)
  x: number; y: number;   // posición
  vx: number; vy: number; // velocidad
  ax: number; ay: number; // aceleración (se recalcula)
  color: number;          // color PIXI (0xRRGGBB)
  static?: boolean;       // si es “anclado”
}

export interface PhysParams {
  G: number;       // constante gravitatoria (escala ficticia)
  dt: number;      // paso de tiempo (segundos simulados por tick)
  eps: number;     // softening (px) para evitar singularidades
  running: boolean;
  speed: number;   // multiplicador x0.25..x4
}

@Injectable({ providedIn: 'root' })
export class PhysicsService {
  /** Estado observable para que la UI lea/cambie parámetros */
  readonly params$ = new BehaviorSubject<PhysParams>({
    G: 0.5, dt: 1/60, eps: 4, running: true, speed: 1
  });

  /** Lista de cuerpos vivos (modelo de la simulación) */
  readonly bodies$ = new BehaviorSubject<Body[]>([]);

  private idCounter = 0;

  /** API: crear cuerpo */
  addBody(partial: Partial<Body>): Body {
    const b: Body = {
      id: `b${this.idCounter++}`,
      name: partial.name ?? 'body',
      m: partial.m ?? 10,
      r: partial.r ?? 10,
      x: partial.x ?? 0, y: partial.y ?? 0,
      vx: partial.vx ?? 0, vy: partial.vy ?? 0,
      ax: 0, ay: 0,
      color: partial.color ?? 0xffa7d1, // cute pink
      static: partial.static ?? false,
    };
    this.bodies$.next([...this.bodies$.value, b]);
    return b;
  }

  /** API: borrar todo */
  clear() { this.bodies$.next([]); }

  /** API: play/pause/speed y sliders */
  setRunning(v: boolean) { this.params$.next({ ...this.params$.value, running: v }); }
  toggleRunning() { this.setRunning(!this.params$.value.running); }
  setSpeed(mult: number) { this.params$.next({ ...this.params$.value, speed: mult }); }
  setG(v: number) { this.params$.next({ ...this.params$.value, G: v }); }
  setDt(v: number) { this.params$.next({ ...this.params$.value, dt: v }); }
  setEps(v: number) { this.params$.next({ ...this.params$.value, eps: v }); }

  /** Un tick de simulación (Euler-Cromer + softening) */
  step() {
    const { G, dt, eps, running, speed } = this.params$.value;
    if (!running) return;
    const h = dt * speed;
    const bodies = this.bodies$.value;

    // Reset aceleraciones
    for (const b of bodies) { b.ax = 0; b.ay = 0; }

    // Fuerzas gravitatorias (O(N^2))
    for (let i = 0; i < bodies.length; i++) {
      const bi = bodies[i];
      if (bi.static) continue;
      for (let j = 0; j < bodies.length; j++) {
        if (i === j) continue;
        const bj = bodies[j];
        // Vector hacia j
        const dx = bj.x - bi.x;
        const dy = bj.y - bi.y;
        const r2 = dx*dx + dy*dy + eps*eps; // softening
        const invR = 1 / Math.sqrt(r2);
        const invR3 = invR * invR * invR;
        const f = G * bj.m * invR3; // (G * m_j / r^3)
        bi.ax += f * dx;
        bi.ay += f * dy;
      }
    }

    // Integración Euler-Cromer (estable para órbitas)
    for (const b of bodies) {
      if (b.static) continue;
      b.vx += b.ax * h;
      b.vy += b.ay * h;
      b.x  += b.vx * h;
      b.y  += b.vy * h;
    }
    this.bodies$.next(bodies);
  }
}
