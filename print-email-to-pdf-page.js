const striptags = require('striptags');
const parseEmailBody = require('./parse-email-body');

const headerSize = 12;
const textSize = 8;
const maxHeight = 400;



function printDefaultEmail(doc, email) {
    body = parseEmailBody(email.bodies[0]);
    console.log('adding text body: ')
    // add the subject
    doc.fontSize(headerSize)
        .font('./fonts/MiriamLibre-Bold.ttf')
        .text(email.subject, {
            align: 'center'
        });
    // add the body
    doc.fontSize(textSize)
        .font('./fonts/Abel-Regular.ttf')
        .text(striptags(body.textBody), {
            align: 'left',
            height: maxHeight,
        });
};

module.exports = function printEmailToPdfPage(doc, email) {
    printDefaultEmail(doc, email);
};