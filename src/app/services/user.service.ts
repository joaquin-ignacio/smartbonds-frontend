import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, Observable, retry, throwError} from "rxjs";
import {User} from "../interfaces/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  basePathLogin='https://smartbonds.herokuapp.com/api/auth';
  basePathRegister='https://smartbonds.herokuapp.com/api/users';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT'
    })
  };

  constructor(private  http:HttpClient) {
  }

  handleError(error: HttpErrorResponse) {
    if(error.error instanceof  ErrorEvent) {
      console.log(`An error has ocurred: ${error.error.message}`);
    } else {
      console.error(`Backend return code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something went wrong, please try again later.')
  }

  login(data: any):Observable<User> {
    return this.http.post<User>(`${this.basePathLogin}`,JSON.stringify(data), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  register(item: any): Observable<User>{
    return this.http.post<User>(`${this.basePathRegister}`, JSON.stringify(item), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }
}
