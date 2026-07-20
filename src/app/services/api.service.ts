import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Telegram } from '../telegram/telegram';

export interface Topic {
  id: number;
  name: string;
}

export interface AnswerOption {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  topicId: number;
  difficulty: number;
  codeSnippet: string;
  options: AnswerOption[];
}

export interface AnswerRequest {
  optionId: number;
}

export interface AnswerResult {
  correct: boolean;
  correctOptionId: number;
}

export interface UserStats {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'https://vibecode.kringeproduction.ru';
  private http = inject(HttpClient);
  private telegram = inject(Telegram)

  getFeed(opts?: { topic?: number; difficulty?: number; limit?: number }): Observable<Question[]> {
    let params = new HttpParams();
    if (opts?.topic != null)      params = params.set('topic', opts.topic);
    if (opts?.difficulty != null) params = params.set('difficulty', opts.difficulty);
    if (opts?.limit != null)      params = params.set('limit', opts.limit);

    this.telegram.alerter(JSON.stringify(params))

    return this.http.get<Question[]>(`${this.baseUrl}/questions/feed`, { params })
      .pipe(tap((val) => this.telegram.alerter(JSON.stringify(val))))
  }

  submitAnswer(questionId: number, optionId: number): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(
      `${this.baseUrl}/questions/${questionId}/answer`,
      { optionId },
    );
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.baseUrl}/users/me/stats`);
  }

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.baseUrl}/topics`);
  }
}
