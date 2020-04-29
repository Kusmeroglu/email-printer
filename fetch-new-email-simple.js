const imapSimple = require('imap-simple');
const util = require('util');
const _ = require('lodash');
const emailSettings = require('./credentials/email_imap.json');

module.exports = function fetchNewEmail() {
    return imapSimple.connect({imap: emailSettings}).then((connection) => {
        return connection.openBox('INBOX').then(() => {
            // fetch all unread messages since before I wrote this script
            //const f = imapClient.seq.fetch([ 'UNSEEN', ['SINCE', 'Jan 1, 2020'] ],
            return connection.search([ 'UNSEEN', ['SINCE', 'Jan 1, 2020'] ], {
                bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                struct: true,
                markSeen: false,
            });
        }).then((messages) => {
            const emails = [];

            messages.forEach((message) => {
                //const parts = imapSimple.getParts(message.attributes.struct);
                console.log('email info is', JSON.stringify(message, null, 2));
            });
        });
    });
};