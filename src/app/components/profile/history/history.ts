import { Component, input } from '@angular/core';
import { HistoryQuestion } from '../../../services/api.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  imports: [DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  data = input<HistoryQuestion>();
}
