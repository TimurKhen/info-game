import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface Topic {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl = 'https://vibecode.kringeproduction.ru';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    // Use optional chaining for environments where Telegram WebApp isn't initialized yet
    const initData = (window as any).Telegram?.WebApp?.initData;
    if (initData) {
      headers = headers.set('Authorization', `tma ${initData}`);
    }
    return headers;
  }

  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.baseUrl}/topics`, { headers: this.getHeaders() });
  }

  getFeed(difficulty?: number, topic?: number, limit: number = 10): Observable<Question[]> {
    let params = new HttpParams().set('limit', limit);
    if (difficulty !== undefined) params = params.set('difficulty', difficulty);
    if (topic !== undefined) params = params.set('topic', topic);

    return this.http.get<Question[]>(`${this.baseUrl}/questions/feed`, { params, headers: this.getHeaders() });
  }

  submitAnswer(questionId: number, answer: AnswerRequest): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(`${this.baseUrl}/questions/${questionId}/answer`, answer, { headers: this.getHeaders() });
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.baseUrl}/users/me/stats`, { headers: this.getHeaders() });
  }
}
