const _ = require('lodash');
const striptags = require('striptags');
const parseEmailBody = require('./parse-email-body');

const headerSize = 12;
const textSize = 8;
const maxHeight = 400;
const width = 144;

const embeddedImageRegEx = /\[image: (.*)\]/;

function printDefaultEmail(doc, email, maxWidth) {
    const parsedEmail = parseEmailBody(email.bodies[0]);
    console.log('parsed body is', JSON.stringify(parsedEmail, null, 2));
    console.log('adding text body only');
    // add the subject
    doc.fontSize(headerSize)
        .font('./fonts/MiriamLibre-Bold.ttf')
        .text(email.subject, {
            align: 'center'
        });
    // add the body and any embedded images by looking for [image: <filename>] sections
    const textBody = striptags(parsedEmail.textBody);
    _.forEach(textBody.split(/(\[image: .*\])/), (textSection) => {
        const checkImageEmbed = textSection.match(embeddedImageRegEx);
        if (checkImageEmbed) {
            const imageName = checkImageEmbed[1];
            const embeddedImage = _.find(parsedEmail.images, (imageInfo) => { return imageInfo.name == imageName });
            doc.image(embeddedImage.body, {
                align: 'center',
                fit: [maxWidth, maxHeight],
            });
        } else {
            doc.fontSize(textSize)
                .font('./fonts/Abel-Regular.ttf')
                .text(striptags(parsedEmail.textBody), {
                    align: 'left',
                    height: maxHeight,
                });
        }
    });
};

module.exports = function printEmailToPdfPage(doc, email) {
    printDefaultEmail(doc, email);
};