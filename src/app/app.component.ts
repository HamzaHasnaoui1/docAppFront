import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AngularEditorModule} from '@kolkov/angular-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AngularEditorModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'doc-frontend';
}
