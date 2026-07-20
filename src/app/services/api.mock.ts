import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Question, AnswerResult, UserStats } from './api.service';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {

  private mockQuestions: Question[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    topicId: 1,
    difficulty: (i % 3) + 1,
    codeSnippet: `print("Hello World ${i + 1}")`,
    options: [
      { id: 1, text: `Hello World ${i + 1}` },
      { id: 2, text: `Error` },
      { id: 3, text: `Hello ${i + 1}` }
    ]
  }));

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('/questions/feed') && req.method === 'GET') {
      const limit = Number(req.params.get('limit')) || 10;
      return of(new HttpResponse({ status: 200, body: this.mockQuestions.slice(0, limit) })).pipe(delay(500));
    }

    if (req.url.match(/\/questions\/\d+\/answer/) && req.method === 'POST') {
      const body = req.body;
      const isCorrect = body.optionId === 1; // Arbitrary logic for mock
      const result: AnswerResult = {
        correct: isCorrect,
        correctOptionId: 1
      };
      return of(new HttpResponse({ status: 200, body: result })).pipe(delay(300));
    }

    if (req.url.includes('/users/me/stats') && req.method === 'GET') {
      const stats: UserStats = {
        totalAnswers: 120,
        correctAnswers: 90,
        accuracy: 0.75
      };
      return of(new HttpResponse({ status: 200, body: stats })).pipe(delay(200));
    }

    return next.handle(req);
  }
}
