import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const authEndpoint = /\/auth\/(login|register|refresh)(\?|$)/.test(request.url);
  const attachAuth = (req: typeof request) => {
    let headers = req.headers;
    const authHeaders = auth.authorizationHeaders();
    for (const key of authHeaders.keys()) {
      headers = headers.set(key, authHeaders.getAll(key)!);
    }
    return req.clone({ headers });
  };
  const secured = authEndpoint ? request : attachAuth(request);

  return next(secured).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || authEndpoint)
        return throwError(() => error);
      try {
        return auth.refreshAccessToken().pipe(
          switchMap(() => next(attachAuth(request))),
          catchError((refreshError: unknown) => {
            auth.signOut();
            return throwError(() => refreshError);
          }),
        );
      } catch {
        auth.signOut();
        return throwError(() => error);
      }
    }),
  );
};
