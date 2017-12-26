'use strict';
import { Lesson } from './Models/Lesson'
import { Note } from './Models/Note';
import { Callback } from './Models/Callback';
import * as cheerio from 'cheerio';
import { HttpClient } from './httpClient';

export default class AcadClient {

    callback?: Callback;
    sender?: string;
    httpClient: HttpClient;

    /**
     * Creates an instance of AcadClient.
     * @param {Callback} [callback] Callback function that will be called on parse notes
     * @param {string} [sender] Sender of the request
     * @memberof AcadClient
     */
    constructor(callback?: Callback, sender?: string) {
        this.callback = callback;
        this.sender = sender;
        this.httpClient = new HttpClient();
    }

    /**
     * Fetch for notes on Acad using the credentials passed
     * 
     * @param {string} user User login
     * @param {string} password User password
     * @memberof AcadClient
     */
    FetchNotes(user: string, password: string): void {
        let formData: Object = {
            "user.login": user,
            "user.senha": password,
            "width": "1536",
            "height": "864",
            "urlRedirect": "",
            "subsistemaRedirect": "",
            "acao": "",
            "acessibilidade": "",
        };
        this.httpClient.SendRequest("https://sig.cefetmg.br/sigaa/logar.do?dispatch=logOn", formData)
            .then((homePage: string) => { // Logged 
                let lessonsRequests: Object[] = this.MountLessonsRequests(homePage);
                lessonsRequests.map((request) => {
                    this.httpClient.SendRequest("https://sig.cefetmg.br/sigaa/portais/discente/discente.jsf", request)
                        .then((lessonPage: string) => { // Lesson Page
                            let notesRequest = this.MountNotesRequest(lessonPage);
                            this.httpClient.SendRequest("https://sig.cefetmg.br/sigaa/ava/index.jsf", notesRequest)
                                .then((notesPage: string) => { // Notes Page
                                    this.ParseNotes(notesPage, this.GetLessonName(lessonPage));
                                });
                        });
                })
            }).catch((error) => {
                console.error('Error:', error);
            });
    }

    private MountLessonsRequests(homePage: string): Object[] {
        let $ = cheerio.load(homePage);
        let formList = $("form[id^=form_acessarTurmaVirtual]").toArray();
        let formData: Object[] = [];
        formList.map(element => {
            let lesson: any = {};
            element.children.map((child) => {
                if (child.tagName == "input") {
                    lesson[child.attribs.name] = child.attribs.value;
                } else if (child.tagName == "a") {
                    lesson[child.attribs.id] = child.attribs.id;
                }
            })
            formData.push(lesson);
        });
        return formData;
    }

    private MountNotesRequest(lessonPage: string): Object {
        let $ = cheerio.load(lessonPage);
        return {
            'formMenu': 'formMenu',
            'formMenu:j_id_jsp_311393315_46': 'formMenu:j_id_jsp_311393315_67',
            'formMenu:j_id_jsp_311393315_72': 'formMenu:j_id_jsp_311393315_72',
            'javax.faces.ViewState': $('#javax\\.faces\\.ViewState').attr('value')
        };
    }

    private GetLessonName(lessonPage: string): string {
        let $ = cheerio.load(lessonPage);
        return $('#linkNomeTurma').text();
    }

    private ParseNotes(notesPage: string, lessonName: string): void {
        let lesson = new Lesson(lessonName);
        let $ = cheerio.load(notesPage);
        // Get header row with test data
        var headers = $('tr#trAval *').toArray();
        if (!headers) {
            console.log(Lesson);
            return;
        }
        // Get line with notes
        var cell = $('tr.linhaPar td').toArray();
        let i = 0;
        let note: any;
        headers.map((header, index) => {
            if (header.tagName == 'th') {
                i++;
                if (note) {
                    lesson.Notes.push(note);
                }
                if (header.attribs.id) { // Note
                    note = new Note(cell[i - 1].children[0].data!.replace(/\t|\n/g, ''));
                    note.Name = header.children[0].data;
                    return;
                } else {
                    note = null;
                }
            } else if (header.attribs.id.startsWith('den')) { // Input with test name
                note.Name = this.httpClient.DecodeHtml(header.attribs.value);
            }
            else if (header.attribs.id.startsWith("nota")) { // Input with test value
                note.Max = header.attribs.value;
            }
        });
        if (this.callback && this.sender) this.callback(this.sender!, lesson.toString());
        else console.log(lesson.toString());
    }
}
