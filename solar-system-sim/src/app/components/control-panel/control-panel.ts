import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhysicsService } from '../../services/physics';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-panel.html',
  styleUrls: ['./control-panel.scss'],
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  private phys = inject(PhysicsService);
  private sub = new Subscription();

  // UI state reflejado desde el servicio
  running = true;
  G = 0.5; dt = 1/60; eps = 4;
  speed = 1;

  ngOnInit() {
    this.sub.add(this.phys.params$.subscribe(p => {
      this.running = p.running; this.G = p.G; this.dt = p.dt; this.eps = p.eps; this.speed = p.speed;
    }));
  }
  ngOnDestroy() { this.sub.unsubscribe(); }

  // Acciones
  toggleRun() { this.phys.toggleRunning(); }
  setSpeed(v: number) { this.phys.setSpeed(v); }
  onGChange() { this.phys.setG(this.G); }
  onDtChange() { this.phys.setDt(this.dt); }
  onEpsChange() { this.phys.setEps(this.eps); }
  reset() { this.phys.clear(); }
}
