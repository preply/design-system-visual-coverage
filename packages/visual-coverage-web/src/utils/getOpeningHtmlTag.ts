export function getOpeningHtmlTag(element: Element) {
    let startTagWithAttributes = 'unableToParseTag';
    const splitHtml = element.outerHTML.split('>');
    if (splitHtml.length > 0) startTagWithAttributes = element.outerHTML.split('>')[0] + '>';

    return startTagWithAttributes;
}
