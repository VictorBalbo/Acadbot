'use strict';
import AcadClient from './acadClient'
import Credentials from './credentials'
let BlipSdk = require('blip-sdk');
let WebSocketTransport = require('lime-transport-websocket');

let blipClient = new BlipSdk.ClientBuilder()
    .withIdentifier(Credentials.BlipIdentifier)
    .withAccessKey(Credentials.BlipAccessKey)
    .withTransportFactory(() => new WebSocketTransport())
    .build();

blipClient.connect().then(() => {
    console.log('Connected');
});

blipClient.addMessageReceiver(true, (message: any) => {
    if ((message.content as string).toLowerCase() == 'check') {
        let acadClient = new AcadClient(SendMessage, message.from);
        acadClient.FetchNotes(Credentials.AcadUser, Credentials.AcadPassword);
        blipClient.sendMessage({ type: 'text/plain', to: message.from, content: 'Buscando notas...' });
    } else {
        console.log(message);
    }
});

function SendMessage(to: string, message: string) {
    var msg = { type: 'text/plain', content: message, to: to };
    blipClient.sendMessage(msg);
}