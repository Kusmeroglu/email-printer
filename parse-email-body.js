const _ = require('lodash');
const base64 = require('base-64');
const utf8 = require('utf8');
const striptags = require('striptags');
const parse5 = require('parse5');

const DOUBLERETURN = '\r\n\r\n';

function findPortionMatchingContentType(portions, contentType) {
    return _.find(portions, portion => {
        return -1 !== portion.indexOf('Content-Type: ' + contentType);
    });
}

function getBodyMatchingContentType(portions, contentType) {
    const matchingPortion = findPortionMatchingContentType(portions, contentType);
    if (! matchingPortion) {
        return;
    }
    // the headers should be followed by a double blank line
    const body = matchingPortion.substr(matchingPortion.indexOf(DOUBLERETURN));
    if (matchingPortion.match(/Content-Transfer-Encoding: base64/i)) {
        return base64.decode(body);
    }
    if (matchingPortion.match(/Content-Transfer-Encoding: 7bit/i)) {
        return body;
    }

    return body;
}

function findAllImageAttachments(portions) {
    const bodies = [];
    _.forEach(portions, portion => {
        // don't care about non-images
        if (portion.indexOf('Content-Type: image/') === -1) {
            return;
        }
        const isInline = portion.indexOf('Content-Disposition: inline;') !== -1;
        let fileName = (portion.match(/filename="(.*)"/i) || portion.match(/name="(.*)"/i));
        fileName = fileName ? fileName[1] : 'unknown';
        // the headers should be followed by a double blank line
        let body = portion.substr(portion.indexOf(DOUBLERETURN));
        body = _.replace(body, /=\r\n/g, '');
        body = _.replace(body, /\r\n/g, '');
        if (portion.match(/Content-Transfer-Encoding: base64/i)) {
            body = base64.decode(body);
        }
        bodies.push({
            name: fileName,
            body: body,
            isInline
        });
    });
    return bodies;
};

module.exports = function parseEmailBody(body) {
    const parsedEmail = {
        'textBody': false,
        'htmlBody': false,
        'images': [],
    };
    const separatorMatch = body.match(/^([-\w_=.]+)\r\n/);
    let identifier = separatorMatch ? separatorMatch[1] : null;
    console.log("using identifier: " + identifier);
    if (!identifier) {
        console.error('could not find identifier in ', _.truncate(body));
        return parsedEmail;
    }
    let portions = body.split(identifier);
    console.log('found ', portions);

    parsedEmail.images = findAllImageAttachments(portions);

    // detect multipart/alternative - we should look for text and html body within instead of original portions
    // (we have already parsed all images out)
    const multipartAlternative = findPortionMatchingContentType(portions, 'multipart/alternative');
    if (multipartAlternative) {
        identifier = "--" + multipartAlternative.match(/boundary="(.*)"/)[1];
        const multipartBody = multipartAlternative.substr(multipartAlternative.indexOf(DOUBLERETURN));
        portions = multipartBody.split(identifier);
        console.log('switching to multipart alternative portions', portions);
    }

    // parse text/plain
    const textPortion = getBodyMatchingContentType(portions, 'text/plain');
    if (textPortion) {
        const body = utf8.decode(textPortion);
        // handle 'soft wraps', \r\n preceded by a space
        const softwrapped = _.replace(body, /\s[\r\n]{2}/g, '');
        // change \r\n's to \n's so pdf creation doesn't get weird.
        const cleaned = _.replace(softwrapped, /[\r\n]{2}/g, `\n`);
        console.log(cleaned);
        parsedEmail.textBody = cleaned;
    }

    // parse text/html
    const htmlPortion = getBodyMatchingContentType(portions, 'text/html');
    if (htmlPortion) {
        const returnsRemoved = _.replace(htmlPortion, /=\r\n/g, '');
        const body = returnsRemoved.match(/<body .*>(.*)<\/body>/si);
        const bodyText = striptags(body ? body[0] : '');
        console.log(bodyText);
        parsedEmail.htmlBody = bodyText;
    }

    return parsedEmail;
};