/**
 * @type {import('@omlet/cli').CliHookModule}
 */

let htmlUiTags = new Set([
    "a",
    "abbr",
    "acronym",
    "address",
    "applet",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "basefont",
    "bdi",
    "bdo",
    "bgsound",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "command",
    "content",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "image",
    "img",
    "input",
    "ins",
    "isindex",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "listing",
    "main",
    "map",
    "mark",
    "marquee",
    "math",
    "menu",
    "menuitem",
    "meter",
    "multicol",
    "nav",
    "nextid",
    "nobr",
    "noembed",
    "noframes",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "plaintext",
    "pre",
    "progress",
    "q",
    "rb",
    "rbc",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "search",
    "section",
    "select",
    "shadow",
    "slot",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "sub",
    "summary",
    "sup",
    "svg",
    "table",
    "tbody",
    "td",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
    "xmp",
]);

const { promises: fs, constants: fsConstants } = require("fs");
const path = require("path");

const fileLookupCache = new Map();
async function exists(filePath) {
    const absPath = path.resolve(__dirname, filePath);
    if (fileLookupCache.has(absPath)) {
        return fileLookupCache.get(absPath);
    }
    try {
        await fs.access(absPath, fsConstants.F_OK);
        fileLookupCache.set(absPath, true);
        return true;
    } catch {
        fileLookupCache.set(absPath, false);
        return false;
    }
}

function hasTests(filePath) {
    const testFilePath = filePath.replace(/(.)(\.[jt]sx?)$/, "$1.test$2");
    return exists(testFilePath);
}

function hasStories(filePath) {
    const testFilePath = filePath.replace(/(.)(\.[jt]sx?)$/, "$1.stories$2");
    return exists(testFilePath);
}

/**
 * @type {import('@omlet/cli').CliHookModule}
 */
module.exports = {
    async afterScan(components) {
        for (const component of components) {
            if (component.props.length > 0) {
                component.setMetadata("Number of props", component.props.length);
            }
            component.setMetadata("Has stories", await hasStories(component.filePath));
            component.setMetadata("Has tests", await hasTests(component.filePath));
            component.setMetadata("Project", component.packageName)
        }

        const visualComponents = new Set();
        let updated;

        do {
            updated = false;
            for (const component of components) {
                if (visualComponents.has(component.id)) {
                    continue;
                } else if (component.htmlElementsUsed.some((tag) => htmlUiTags.has(tag))) {
                    component.setMetadata("Is visual component?", true);
                    visualComponents.add(component.id);
                    updated = true;
                } else if (component.children.some(child => visualComponents.has(child.id))) {
                    component.setMetadata("Is visual component?", true);
                    visualComponents.add(component.id);
                    updated = true;
                } else {
                    component.setMetadata("Is visual component?", false);
                }
            }
        } while (updated);
    }
}