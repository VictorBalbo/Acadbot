'use strict';
import { CookieJar } from 'request';
import { RequestPromise } from 'request-promise';
import * as request from 'request-promise';
import * as he from 'he'; // Decode html

export class HttpClient {

    cookieJar: CookieJar;

    constructor() {
        this.cookieJar = request.jar();
    }

    SendRequest(uri: string, formData?: Object): RequestPromise {
        let options = {
            method: 'POST',
            uri: uri,
            form: formData,
            followAllRedirects: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
            },
            jar: this.cookieJar, // Use cookies
        };
        return request(options);
    }

    DecodeHtml(text: string) {
        return he.decode(text);
    }
}