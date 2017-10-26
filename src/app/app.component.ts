import { Component } from '@angular/core';

import { HttpService } from "./http.service";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    docs: any[] = [];

    constructor(private httpService: HttpService, private sanitizer: DomSanitizer) { }

    promiseFileReader(file) {
        return new Promise((resolve, reject) => {
            var fr = new FileReader();
            fr.onloadend = resolve;  // CHANGE to whatever function you want which would eventually call resolve
            fr.readAsDataURL(file);
        });
    }

    onSubmit(id, file) {
        console.log("id");
        console.log(id["value"]);
        this.promiseFileReader(file["files"][0])
            .then((data) => {
                let document = {
                    id: id,
                    name: file["files"][0].name,
                    _attachments: {}
                };

                document._attachments[file["files"][0].name] = {
                    "content_type": file["files"][0].type,
                    "data": data["target"].result.split(/,(.+)/)[1]
                }

                console.log("saved document");
                console.log(document);

                this.httpService.addDocument(document)
                    .subscribe(
                    data => this.onGetData(), //this.addAttachment(file, data),
                    error => console.log(error)
                    );

            });

    }

    // Si on veut ajouter un document a posteriori
    addAttachment(file, document) {
        console.log("addAttachment");
        console.log(document);
        this.promiseFileReader(file["files"][0])
            .then((data) => {
                // console.log("data");
                //   console.log(data["target"].result);
                let attachment = {
                    _id: document.id,
                    _rev: document.rev,
                    type: file["files"][0].type,
                    name: file["files"][0].name,
                    data: data["target"].result.split(/,(.+)/)[1]
                }
                this.httpService.addAttachment(attachment)
                    .subscribe(
                    data => this.onGetData(),
                    error => console.log(error)
                    );
            });
    }

    documentUrl(attachment) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(attachment.url);
    }

    onGetData() {
        this.httpService.getOwnData()
            .subscribe(
            data => {
                const myArray = [];
                for (let key in data["rows"]) {
                    let document = {
                        _id: data["rows"][key].doc._id,
                        _rev: data["rows"][key].doc._rev,
                        name: data["rows"][key].doc.name,
                    }
                    if (data["rows"][key].doc._attachments != null) {
                        // console.log("data[rows][key].doc._attachments");
                        console.log(data["rows"][key].doc._attachments);
                        let attachments = [];
                        for (let key2 in data["rows"][key].doc._attachments) {
                            let data_atttachment = data["rows"][key].doc._attachments[key2]["data"];
                            let data_type = data["rows"][key].doc._attachments[key2]["content_type"];

                            // base64 string
                            var base64str = data_atttachment;

                            // decode base64 string, remove space for IE compatibility
                            var binary = atob(base64str.replace(/\s/g, ''));
                            var len = binary.length;
                            var buffer = new ArrayBuffer(len);
                            var view = new Uint8Array(buffer);
                            for (var i = 0; i < len; i++) {
                                view[i] = binary.charCodeAt(i);
                            }

                            // create the blob object with content-type "application/pdf"
                            var blob = new Blob([view], { type: data_type });
                            var url = URL.createObjectURL(blob);
                            // console.log(key2);
                            // console.log(data_atttachment);
                            let attachment = { title: key2, type: data_type, url: url };
                            attachments.push(attachment);
                        }
                        document["attachments"] = attachments;
                    }

                    myArray.push(document);
                }
                this.docs = myArray;
            }
            );
    }
}
