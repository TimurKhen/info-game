import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getFeed(difficulty?: number, topic?: number, limit: number = 10): Observable<Question[]> {
    let params = new HttpParams().set('limit', limit);
    if (difficulty !== undefined) params = params.set('difficulty', difficulty);
    if (topic !== undefined) params = params.set('topic', topic);

    return this.http.get<Question[]>('/questions/feed', { params });
  }

  submitAnswer(questionId: number, answer: AnswerRequest): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(`/questions/${questionId}/answer`, answer);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>('/users/me/stats');
  }
}
