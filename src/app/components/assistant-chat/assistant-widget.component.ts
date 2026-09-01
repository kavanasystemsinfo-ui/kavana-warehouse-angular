import { Component } from '@angular/core';
import { AssistantChatComponent } from './assistant-chat.component';

// Widget flotante del asistente, visible en la pantalla de login (sin credenciales).
@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [AssistantChatComponent],
  templateUrl: './assistant-widget.component.html',
  styleUrls: ['./assistant-widget.component.scss']
})
export class AssistantWidgetComponent {
  open = false;
}