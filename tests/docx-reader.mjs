/**
 * What loadDocx reads for the document-structure rules (images, text boxes,
 * captions, tables, italics), and that comments about objects with no text
 * of their own still land in the marked-up document.
 *
 * Usage:  node tests/docx-reader.mjs
 *
 * The test document is built in memory, so there is no fixture to keep in step.
 */
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import JSZip from 'jszip';
import { RULES } from '../src/rules.js';
import { loadDocx, annotateDocx } from '../src/docx-annotate.js';

const env = { DOMParser, XMLSerializer, JSZip };
let pass = 0, fail = 0;
function check(name, ok, detail) {
    console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name + (ok || !detail ? '' : ' :: ' + detail));
    ok ? pass++ : fail++;
}

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
    'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" ' +
    'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" ' +
    'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" ' +
    'xmlns:adec="http://schemas.microsoft.com/office/drawing/2017/decorative"';

const para = (text, opts = {}) =>
    '<w:p>' + (opts.style ? '<w:pPr><w:pStyle w:val="' + opts.style + '"/></w:pPr>' : '') +
    '<w:r>' + (opts.italic ? '<w:rPr><w:i/></w:rPr>' : '') +
    '<w:t xml:space="preserve">' + text + '</w:t></w:r>' + (opts.extra || '') + '</w:p>';

const picture = (id, descr, decorative) =>
    '<w:r><w:drawing><wp:inline><wp:docPr id="' + id + '" name="Picture ' + id + '"' +
    (descr !== null ? ' descr="' + descr + '"' : '') + '>' +
    (decorative ? '<a:extLst><a:ext uri="{C183D7F6-B498-43B3-948B-1728B52AA6E4}"><adec:decorative val="1"/></a:ext></a:extLst>' : '') +
    '</wp:docPr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
    '<pic:pic/></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';

const textBox =
    '<w:r><mc:AlternateContent><mc:Choice Requires="wps"><w:drawing><wp:anchor><wp:docPr id="9" name="Text Box 9"/>' +
    '<a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">' +
    '<wps:wsp><wps:txbx><w:txbxContent><w:p><w:r><w:t>Hidden from the checker</w:t></w:r></w:p></w:txbxContent></wps:txbx></wps:wsp>' +
    '</a:graphicData></a:graphic></wp:anchor></w:drawing></mc:Choice>' +
    '<mc:Fallback><w:pict><w:txbxContent><w:p><w:r><w:t>Hidden from the checker</w:t></w:r></w:p></w:txbxContent></w:pict></mc:Fallback>' +
    '</mc:AlternateContent></w:r>';

const cell = t => '<w:tc><w:p><w:r><w:t>' + t + '</w:t></w:r></w:p></w:tc>';
const table = (header) =>
    '<w:tbl><w:tr>' + (header ? '<w:trPr><w:tblHeader/></w:trPr>' : '') + cell('State') + cell('Rate') + '</w:tr>' +
    '<w:tr>' + cell('NSW') + cell('12') + '</w:tr></w:tbl>';

const body =
    para('Report title', { style: 'Heading1' }) +
    para('The first section explains the trend.') +
    '<w:p>' + picture(1, '', false) + '</w:p>' +
    para('Figure 1: Admissions rose.', { style: 'Caption' }) +
    '<w:p>' + picture(2, null, true) + '</w:p>' +
    para('A decorative image sits above.') +
    para('Smith ') + // the italic run follows in its own paragraph
    para('et al.', { italic: true }) +
    para('A note sits beside a box.', { extra: textBox }) +
    table(false) +
    para('Between the tables.') +
    table(true) +
    para('The end.');

// A byte-order mark before the declaration, as one real AIHW document had
const documentXml = '﻿<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document ' + NS + '><w:body>' + body + '</w:body></w:document>';

const zip = new JSZip();
zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
zip.file('word/document.xml', documentXml);
const buffer = await zip.generateAsync({ type: 'arraybuffer' });

// ---- the reader ----
let loaded;
try {
    loaded = await loadDocx(buffer, env);
    check('a byte-order mark before the XML declaration is accepted', true);
} catch (err) {
    check('a byte-order mark before the XML declaration is accepted', false, err.message);
    process.exit(1);
}
const lineOf = t => loaded.fullText.split('\n').indexOf(t);
check('2 pictures found', loaded.images.length === 2, JSON.stringify(loaded.images));
check('picture with empty alt text read as empty', loaded.images[0] && loaded.images[0].alt === '' && !loaded.images[0].decorative);
check('decorative picture read as decorative', loaded.images[1] && loaded.images[1].decorative === true);
check('text box found once (Choice and Fallback not double-counted)',
    loaded.textBoxes.length === 1 && loaded.textBoxes[0].count === 1, JSON.stringify(loaded.textBoxes));
check('text box text is not part of the document text', !loaded.fullText.includes('Hidden from the checker'));
check('caption line found', loaded.captionLines.has(lineOf('Figure 1: Admissions rose.')));
check('2 tables found', loaded.tables.length === 2, JSON.stringify(loaded.tables));
check('table header rows read', loaded.tables[0] && !loaded.tables[0].headerRow && loaded.tables[1].headerRow);
check('table anchored at its first cell', loaded.tables[0] && loaded.tables[0].line === lineOf('State'));
check('italic run found', loaded.italics.some(r => r.text === 'et al.'));

// ---- the rules on it ----
const issues = [];
for (const rule of RULES) {
    issues.push(...rule.check(loaded.fullText, loaded.headingLines, loaded.listLines,
        loaded.boldLines, loaded.italicLines, loaded.tableLines, loaded));
}
const ids = id => issues.filter(i => i.rule.id === id);
check('missing alt text flagged once (decorative image skipped)', ids('accessibility-image-alt-text').length === 1);
check('text box flagged', ids('accessibility-text-box').length === 1);
check('caption full stop flagged with a fix', ids('format-caption-full-stop').length === 1 &&
    ids('format-caption-full-stop')[0].autoFix === 'Figure 1: Admissions rose');
check('table without a header row flagged once', ids('accessibility-table-header-row').length === 1);
check('italic et al. flagged', ids('format-latin-italic').length === 1);
for (const i of issues) {
    if (loaded.fullText.substr(i.position, i.found.length) !== i.found) {
        check('position of ' + i.rule.id, false, JSON.stringify(i.found));
    }
}

// ---- the marked-up document ----
const structureIds = ['accessibility-image-alt-text', 'accessibility-text-box',
    'accessibility-table-header-row', 'format-latin-italic'];
const structural = issues.filter(i => structureIds.includes(i.rule.id));
const fresh = await loadDocx(buffer, env);
const result = await annotateDocx(fresh, structural, env, { author: 'Test', initials: 'T' });
check('a comment for every object issue', result.commentCount === structural.length,
    result.commentCount + ' of ' + structural.length);
const outXml = await result.zip.file('word/document.xml').async('string');
const parsed = new DOMParser({ onError: () => {} }).parseFromString(outXml, 'application/xml');
check('document.xml still well formed', parsed.getElementsByTagName('parsererror').length === 0 &&
    parsed.getElementsByTagName('w:body').length === 1);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
