/**
 *
 * @param {string} text
 * @param {string} textToHighlight
 * @returns string
 */
function highlight(text, textToHighlight) {
  if (textToHighlight.length > 0)
    return text
      .toLowerCase()
      .replace(
        textToHighlight,
        "<span class='highlight'>" + textToHighlight + "</span>"
      );
  else return text;
}

function getDomainNameFromUrl(url) {
  let domain = new URL(url);
  return domain.hostname.replace("www.", "");
}
