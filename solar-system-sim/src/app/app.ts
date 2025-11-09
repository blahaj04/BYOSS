import { Component, signal } from '@angular/core';
import { ControlPanelComponent } from './components/control-panel/control-panel';
import { SolarSceneComponent } from './components/solar-scene/solar-scene';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ControlPanelComponent, SolarSceneComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('solar-system-sim');
}
