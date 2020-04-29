const util = require('util');
const _ = require('lodash');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const fetchNewEmail = require('./fetch-new-email-simple');
const printEmailToPdfPage = require('./print-email-to-pdf-page');

const width = 144;
const maxheight = 500;

fetchNewEmail().then((list) => {
    console.log(`Received ${list.length} emails`);
    const doc = new PDFDocument({ autoFirstPage: false });

    // create tmp if it needs creating, and assume the log file needs creating too
    if (!fs.existsSync('./tmp')){
        fs.mkdirSync('./tmp');
        fs.mkdirSync('./log');
    }
    doc.pipe(fs.createWriteStream('./tmp/current.pdf'));

    _.forEach(list, email => {
        console.log('Adding page for email', email);
        console.log('START >>>>>>>>>>>>');
        doc.addPage({
            size: [width, maxheight],
            margins: {
                left: 5,
                right: 5,
                top: 10,
                bottom: 10,
            }
        });
        // create a test file for this email
        fs.writeFileSync(email.from[0]+'.email', email.bodies, { flag: 'w' });
        printEmailToPdfPage(doc, email, maxWidth = width);
        console.log('FINISH <<<<<<<<<<<');
    });

    doc.end();
    //console.log(util.inspect(list));
}).catch((err) => {
    console.log(`Received ${err}`);
    console.log(err.stack);
});