const imap = require('imap');
const util = require('util');
const _ = require('lodash');
const emailSettings = require('./credentials/email_imap.json');

const imapClient = new imap(emailSettings);

function parseMessage(msg) {
    return new Promise(((resolve, reject) => {
        const email = { bodies: [] };
        msg.on('body', function(stream, info) {
            console.log('Body [%s] found, %d total bytes', util.inspect(info.which), info.size);
            var buffer = '', count = 0;
            stream.on('data', function(chunk) {
                count += chunk.length;
                buffer += chunk.toString('utf8');
                if (info.which === 'TEXT')
                    console.log('Body [%s] (%d/%d)', util.inspect(info.which), count, info.size);
            });
            stream.once('end', function() {
                if (info.which !== 'TEXT') {
                    const parsedHeaders = imap.parseHeader(buffer);
                    _.assign(email, parsedHeaders);
                    console.log('Parsed header: %s', util.inspect(parsedHeaders));
                }
                else {
                    console.log('Body [%s] Finished', util.inspect(info.which));
                    email.bodies.push(buffer);
                }
            });
        });
        msg.once('end', function() {
            console.log('---end msg---');
            resolve(email);
        });
    }))
}

module.exports = function fetchNewEmail() {
    return new Promise((resolve, reject) => {
        const emailList = [];

        imapClient.once('ready', function() {
            // note, readOnly must be false in order for fetch to mark as read.
            imapClient.openBox('INBOX', false, function(err) {
                if (err) {
                    throw err;
                }
                // fetch all unread messages since before I wrote this script
                //const f = imapClient.seq.fetch([ 'UNSEEN', ['SINCE', 'Jan 1, 2020'] ],
                imapClient.search([ 'UNSEEN', ['SINCE', 'Jan 1, 2020'] ], (err, results) => {
                    const f = imapClient.fetch(results, {
                        bodies: ['HEADER.FIELDS (FROM TO SUBJECT)', 'TEXT'],
                        markSeen: true, // only works if inbox is not readOnly
                    });
                    // add each found message to our list
                    f.on('message', function(msg, seqno) {
                        console.log('---Start Message #%d ---', seqno);
                        parseMessage(msg).then(email => emailList.push(email));
                    });
                    f.once('error', function(err) {
                        console.log('Fetch Error');
                        console.trace(err);
                    });
                    f.once('end', function() {
                        console.log('Done fetching all messages!');
                        imapClient.end();
                    });
                });
            });
        });
        imapClient.once('error', function(err) {
            console.trace(err);
            reject(err);
        });

        imapClient.once('end', function() {
             resolve(emailList);
            console.log('Connection ended');
        });
        imapClient.connect();
    });
};