import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ ErrorInterceptor - Erreur HTTP:', {
          url: request.url,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        
        let errorMessage = 'Une erreur est survenue';
        
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = error.error.message;
          console.error('❌ ErrorInterceptor - Erreur côté client:', errorMessage);
        } else {
          // Erreur côté serveur
          switch (error.status) {
            case 401:
              errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
              console.error('❌ ErrorInterceptor - 401 Unauthorized - Redirection vers login');
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
              console.error('❌ ErrorInterceptor - 403 Forbidden');
              break;
            case 404:
              errorMessage = 'Ressource non trouvée.';
              console.error('❌ ErrorInterceptor - 404 Not Found');
              break;
            case 500:
              errorMessage = 'Erreur interne du serveur.';
              console.error('❌ ErrorInterceptor - 500 Internal Server Error');
              break;
            default:
              errorMessage = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
              console.error('❌ ErrorInterceptor - Erreur inconnue:', error.status);
          }
        }
        
        console.error('❌ ErrorInterceptor - Message d\'erreur final:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}