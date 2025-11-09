import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PhysicsService, Body } from '../../services/physics';
import { Application, Graphics, Container } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-solar-scene',
  standalone: true,
  templateUrl: './solar-scene.html',
  styleUrls: ['./solar-scene.scss'],
})
export class SolarSceneComponent implements OnInit, OnDestroy {
  private phys = inject(PhysicsService);
  private app!: Application;
  private viewport!: Viewport;
  private subs = new Subscription();
  private sprites = new Map<string, Graphics>();
  private scene = new Container();

  async ngOnInit() {
    // Avoid running PIXI / DOM code during server-side rendering
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // PIXI app
    this.app = new Application();
    await this.app.init({ resizeTo: window, antialias: true, background: '#0b1020' });
    document.getElementById('sceneContainer')!.appendChild(this.app.canvas);

    // Fondo cute (estrellitas simples)
    const stars = new Graphics();
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      stars.circle(x, y, Math.random() * 1.5 + 0.5).fill(0xffffff);
    }
    this.app.stage.addChild(stars);

    // Viewport pan/zoom
    this.viewport = new Viewport({
      events: this.app.renderer.events,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: 5000,
      worldHeight: 5000,
    });
    this.viewport.drag().pinch().wheel().decelerate();
    this.app.stage.addChild(this.viewport);

    // Contenedor de cuerpos
    this.viewport.addChild(this.scene);

    // Suscribirse a cuerpos y dibujar
    this.subs.add(this.phys.bodies$.subscribe(bodies => this.syncSprites(bodies)));

    // Bucle de simulación (tick lógico) + render
    this.app.ticker.add(() => {
      this.phys.step();     // avanza física (si running)
      this.renderBodies();  // pinta sprites según modelo
    });

    // Demo inicial: un sol estático + un planeta en órbita
    if (this.phys.bodies$.value.length === 0) {
      this.phys.addBody({ name: 'Sol', x: 0, y: 0, m: 1000, r: 18, color: 0xffe082, static: true });
      this.phys.addBody({ name: 'LunaCute', x: 200, y: 0, m: 5, r: 10, color: 0xa7d1ff, vy: 1.6 });
    }
  }

  ngOnDestroy() { this.subs.unsubscribe(); if (this.app) { this.app.destroy(true); } }

  private syncSprites(bodies: Body[]) {
    // Crea/actualiza/elimina sprites para que coincidan con bodies[]
    const seen = new Set<string>();
    for (const b of bodies) {
      seen.add(b.id);
      let g = this.sprites.get(b.id);
      if (!g) {
        g = new Graphics();
        g.cursor = 'pointer';
        this.scene.addChild(g);
        this.sprites.set(b.id, g);
      }
      // (el fill/line se hace en renderBodies)
    }
    // eliminar sprites huérfanos
    for (const [id, g] of this.sprites) {
      if (!seen.has(id)) { g.destroy(); this.sprites.delete(id); }
    }
  }

  private renderBodies() {
    const bodies = this.phys.bodies$.value;
    for (const b of bodies) {
      const g = this.sprites.get(b.id)!;
      g.clear();
      // “carita cute”: círculo + ojos
      g.circle(b.x, b.y, b.r).fill(b.color).stroke({ color: 0x000000, width: 1, alpha: 0.2 });
      const eyeOffset = Math.max(2, b.r * 0.35);
      g.circle(b.x - eyeOffset, b.y - eyeOffset * 0.3, Math.max(1, b.r * 0.12)).fill(0x2c2c2c);
      g.circle(b.x + eyeOffset, b.y - eyeOffset * 0.3, Math.max(1, b.r * 0.12)).fill(0x2c2c2c);
    }
  }
}
