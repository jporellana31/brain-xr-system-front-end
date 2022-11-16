import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../interfaces/User';
//import { Usuario } from "../modelo/usuario";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _usuario: Usuario| null = new Usuario();
  private _token: string| null=null;

  constructor(private http: HttpClient) {}

  getUserRegisters() {
    return this.http.get<Usuario[]>(environment.Url + '/personas');
  }

  registerUser(usuario: Usuario) {
    let json = JSON.stringify(usuario);
    let params = json;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(environment.Url + '/usuario', params, { headers: headers })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }


  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (
      this._usuario == null &&
      sessionStorage.getItem('usuario') != null
    ) {
      this._usuario = JSON.parse(sessionStorage.getItem('usuario')!) as Usuario;
      return this._usuario;
    }
    return new Usuario();
  }

  public get tokencito(): string| null {
    if (this._token != null) {
      return this._token;
    } else if (this._token == null && sessionStorage.getItem('token') != null) {
      this._token = sessionStorage.getItem('token');
      return this._token;
    }
    return null;
  }

  login(usuario: Usuario): Observable<any> {
    const urlEndpoint = environment.UrlAuth + 'oauth/token';

    const credenciales = btoa('angularapp' + ':' + '12345');

    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + credenciales,
    });

    let params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.email);
    params.set('password', usuario.password);
    //console.log(params.toString());
    return this.http.post<any>(urlEndpoint, params.toString(), {
      headers: httpHeaders,
    });
  }

  guardarUsuario(accessToken: string): void {
    let payload = this.obtenerDatosToken(accessToken);
    //console.log(payload);
    this._usuario = new Usuario();
    this._usuario.id = payload.id;
    this._usuario.nombre = payload.nombre;
    this._usuario.apellido = payload.apellido;
    this._usuario.email = payload.roles;
    this._usuario.email = payload.user_name;
    this._usuario.roles = payload.authorities;
    sessionStorage.setItem('usuario', JSON.stringify(this._usuario));
  }

  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem('token', accessToken);
  }

  obtenerDatosToken(accessToken: string): any {
    if (accessToken != null) {
      return JSON.parse(atob(accessToken.split('.')[1]));
    }
    return null;
  }

  isAuthenticated(): boolean {
    let payload = this.obtenerDatosToken(this.tokencito!);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }

  hasRole(role: string): boolean {
    if (this.usuario.roles.includes(role)) {
      return true;
    }
    return false;
  }

  logout(): void {
    this._token = null;
    this._usuario = null;
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
   // alert("");
    localStorage.removeItem('tipo_productos');
    localStorage.clear();

  }


 /* loginAutomatico(){

    this.logout();
     let user: Usuario = new Usuario();
     user.email = 'soporte.alaorden@gmail.com';
     user.password = btoa('igPqEn');
     this.login(user).subscribe(res => {

   this.guardarUsuario(res.access_token);
     this.guardarToken(res.access_token);
    // this._route.navigateByUrl('/home/inicio');
    return true;


   }, error =>{
        //alert("Erro Login");

        // console.log(error.error);
          // console.log(error.error);
          // this.cargando = false;
       });
    }*/

}
