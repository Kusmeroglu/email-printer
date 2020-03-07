const _ = require('lodash');
const base64 = require('base-64');
const utf8 = require('utf8');
const striptags = require('striptags');

function findPortionMatchingContentType(portions, contentType) {
    const matchingPortion = _.find(portions, portion => {
        return -1 !== portion.indexOf('Content-Type: ' + contentType);
    });
    if (! matchingPortion) {
        return;
    }
    const body = matchingPortion.split('\r\n\r\n')[1];
    if (matchingPortion.indexOf('Content-Transfer-Encoding: base64') !== -1) {
        return base64.decode(body);
    }
    return body;
}

module.exports = function parseEmailBody(body) {
    const parsedEmail = {
        'textBody': false,
        'htmlBody': false
    };
    const identifier = body.match(/^(--\w+)\r\n/)[1];
    console.log(identifier);
    if (!identifier) {
        console.error('could not find identifier in ', _.truncate(body));
        return parsedEmail;
    }
    const portions = body.split(identifier);
    console.log('found ', portions);

    // parse text/plain
    const textPortion = findPortionMatchingContentType(portions, 'text/plain');
    if (textPortion) {
        const body = utf8.decode(textPortion);
        console.log('TEXT BODY ');
        // allow 'soft wraps' with a space, then an \r\n
        const softwrapped = _.replace(body, /\s[\r\n]{2}/g, '');
        // change \r\n's to \n's so pdf creation doesn't get weird.
        const cleaned = _.replace(softwrapped, /[\r\n]{2}/g, `\n`);
        console.log(cleaned);
        parsedEmail.textBody = cleaned;
    }

    // parse text/html
    const htmlPortion = findPortionMatchingContentType(portions, 'text/html');
    if (htmlPortion) {
        const body = striptags(_.replace(htmlPortion, /=\r\n/g, ''));
        console.log('HTML BODY ');
        console.log(body);
        parsedEmail.htmlBody = body;
    }

    return parsedEmail;
};