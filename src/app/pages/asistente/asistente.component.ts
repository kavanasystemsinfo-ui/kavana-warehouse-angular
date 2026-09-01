import { Component } from '@angular/core';
import { AssistantChatComponent } from '../../components/assistant-chat/assistant-chat.component';

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [AssistantChatComponent],
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.scss']
})
export class AsistenteComponent {}