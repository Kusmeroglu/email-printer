const util = require('util');
const _ = require('lodash');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const fetchNewEmail = require('./fetch-new-email');
const printEmailToPdfPage = require('./print-email-to-pdf-page');

const width = 144;
const maxheight = 500;

fetchNewEmail().then((list) => {
    console.log(`Received ${list.length} emails`);
    const doc = new PDFDocument({ autoFirstPage: false });
    doc.pipe(fs.createWriteStream('./tmp/current.pdf'));

    _.forEach(list, email => {
        doc.addPage({
            size: [width, maxheight],
            margins: {
                left: 5,
                right: 5,
                top: 10,
                bottom: 10,
            }
        });
        printEmailToPdfPage(doc, email);
    });

    doc.end();
    //console.log(util.inspect(list));
}).catch((err) => {
    console.log(`Received ${err}`)
});