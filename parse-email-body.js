const _ = require('lodash');
const base64 = require('base-64');
const utf8 = require('utf8');
const striptags = require('striptags');
const parse5 = require('parse5');

function findPortionMatchingContentType(portions, contentType) {
    const matchingPortion = _.find(portions, portion => {
        return -1 !== portion.indexOf('Content-Type: ' + contentType);
    });
    if (! matchingPortion) {
        return;
    }
    // the headers should be followed by a double blank line
    const body = matchingPortion.substr(matchingPortion.indexOf('\r\n\r\n'));
    if (matchingPortion.match(/Content-Transfer-Encoding: base64/i)) {
        return base64.decode(body);
    }
    if (matchingPortion.match(/Content-Transfer-Encoding: 7bit/i)) {
        return body;
    }

    return body;
}

module.exports = function parseEmailBody(body) {
    const parsedEmail = {
        'textBody': false,
        'htmlBody': false
    };
    const separatorMatch = body.match(/^([-\w_=.]+)\r\n/);
    const identifier = separatorMatch ? separatorMatch[1] : null;
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
        // handle 'soft wraps' with a space, then an \r\n
        const softwrapped = _.replace(body, /\s[\r\n]{2}/g, '');
        // change \r\n's to \n's so pdf creation doesn't get weird.
        const cleaned = _.replace(softwrapped, /[\r\n]{2}/g, `\n`);
        console.log(cleaned);
        parsedEmail.textBody = cleaned;
    }

    // parse text/html
    const htmlPortion = findPortionMatchingContentType(portions, 'text/html');
    if (htmlPortion) {
        const returnsRemoved = _.replace(htmlPortion, /=\r\n/g, '');
        console.log('Looking for html <body>', returnsRemoved);
        const body = returnsRemoved.match(/<body .*>(.*)<\/body>/si);
        console.log('Found html <body>', body);
        const bodyText = striptags(body ? body[0] : '');
        console.log('HTML BODY ');
        console.log(bodyText);
        parsedEmail.htmlBody = bodyText;
    }

    return parsedEmail;
};