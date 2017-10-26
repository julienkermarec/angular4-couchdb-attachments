import { Injectable } from '@angular/core';
import { Http, Response, Headers } from "@angular/http";
import 'rxjs/Rx';
import { Observable } from "rxjs/Rx";

@Injectable()
export class HttpService {

    private SERVER_URL = 'http://127.0.0.1:5984/mabase/';

    constructor(private http: Http) {
    }

    getData() {
        return this.http.get(this.SERVER_URL + '_all_docs?include_docs=true')
            .map((response: Response) => response.json());
    }

    addDocument(document: any) {
        const body = JSON.stringify(document);
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this.SERVER_URL, body, {
            headers: headers
        })
            .map((data: Response) => data.json())
            .catch(this.handleError);
    }
    addAttachment(document: any) {
        const headers = new Headers();
        headers.append('Content-Type', document.type);
        return this.http.put(this.SERVER_URL + document._id + '/' + document.name + '?rev=' + document._rev + '', document.data, {
            headers: headers
        })
            .map((data: Response) => data.json())
            .catch(this.handleError);
    }

    getOwnData() {
        return this.http.get(this.SERVER_URL + '/_all_docs?include_docs=true&attachments=true')
            .map((response: Response) => response.json());
    }

    private handleError(error: any) {
        console.log(error);
        return Observable.throw(error.json());
    }
}
