import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    console.log('🔍 AuthInterceptor - URL:', req.url, 'Token présent:', !!token);
    
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ AuthInterceptor - Token ajouté à la requête');
      return next.handle(authReq);
    }
    
    console.log('⚠️ AuthInterceptor - Pas de token, requête sans authentification');
    return next.handle(req);
  }
}