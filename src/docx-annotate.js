/**
 * Style Manual Check - docx annotation module
 */

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const COMMENTS_CT = 'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml';
const COMMENTS_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments';

function getEnv(env) {
    return {
        DOMParser: (env && env.DOMParser) || DOMParser,
        XMLSerializer: (env && env.XMLSerializer) || XMLSerializer,
        JSZip: (env && env.JSZip) || (typeof JSZip !== 'undefined' ? JSZip : undefined)
    };
}

function localName(node) {
    return node.localName || node.nodeName.split(':').pop();
}

function isW(node, name) {
    return node.nodeType === 1 && localName(node) === name;
}

function hasAncestor(node, name, stopAt) {
    let cur = node.parentNode;
    while (cur && cur !== stopAt) {
        if (isW(cur, name)) return true;
        cur = cur.parentNode;
    }
    return false;
}

function collectParagraphSegments(pEl) {
    const segments = [];
    let text = '';

    function findRun(node) {
        let cur = node;
        while (cur && !isW(cur, 'r')) cur = cur.parentNode;
        return cur;
    }

    function walk(node) {
        for (let child = node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType !== 1) continue;
            const name = localName(child);
            if (name === 'p' || name === 'pPr' || name === 'Fallback' ||
                name === 'del' || name === 'commentReference') {
                continue;
            }
            if (name === 't') {
                const value = child.textContent || '';
                if (value.length > 0) {
                    segments.push({
                        kind: 't', tNode: child, run: findRun(child),
                        start: text.length, length: value.length
                    });
                    text += value;
                }
                continue;
            }
            if (name === 'tab' || name === 'br' || name === 'cr' ||
                name === 'noBreakHyphen') {
                segments.push({
                    kind: 'atom', run: findRun(child),
                    start: text.length, length: 1
                });
                text += (name === 'tab') ? '\t' : ' ';
                continue;
            }
            walk(child);
        }
    }

    walk(pEl);
    return { text, segments };
}

function getPStyle(pEl) {
    for (let c = pEl.firstChild; c; c = c.nextSibling) {
        if (!isW(c, 'pPr')) continue;
        for (let s = c.firstChild; s; s = s.nextSibling) {
            if (isW(s, 'pStyle')) {
                return s.getAttribute('w:val') || '';
            }
        }
    }
    return '';
}

function hasNumPr(pEl) {
    for (let c = pEl.firstChild; c; c = c.nextSibling) {
        if (!isW(c, 'pPr')) continue;
        for (let s = c.firstChild; s; s = s.nextSibling) {
            if (isW(s, 'numPr')) return true;
        }
    }
    return false;
}

function toggleOn(rPr, name) {
    if (!rPr) return false;
    for (let c = rPr.firstChild; c; c = c.nextSibling) {
        if (isW(c, name)) {
            const val = c.getAttribute('w:val');
            return !(val === '0' || val === 'false' || val === 'none');
        }
    }
    return false;
}

function getRPr(run) {
    for (let c = run.firstChild; c; c = c.nextSibling) {
        if (isW(c, 'rPr')) return c;
    }
    return null;
}

function paragraphToggle(segments, toggleName) {
    const runs = new Set();
    for (const seg of segments) {
        if (seg.kind === 't' && seg.run) runs.add(seg.run);
    }
    if (runs.size === 0) return false;
    for (const run of runs) {
        if (!toggleOn(getRPr(run), toggleName)) return false;
    }
    return true;
}

export async function loadDocx(arrayBuffer, env) {
    const E = getEnv(env);
    const zip = await E.JSZip.loadAsync(arrayBuffer);
    const docFile = zip.file('word/document.xml');
    if (!docFile) {
        throw new Error('This file does not look like a Word document (no word/document.xml).');
    }
    const xml = await docFile.async('string');
    const parser = new E.DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');

    const allP = Array.from(doc.getElementsByTagName('w:p'));
    const paragraphEls = allP.filter(p => !hasAncestor(p, 'p'));

    const paragraphs = [];
    const headingLines = new Set();
    const listLines = new Set();
    const boldLines = new Set();
    const italicLines = new Set();
    const tableLines = new Set();
    const headingLevels = new Map();
    const links = [];
    const underlines = [];
    const lineStarts = [];
    let fullText = '';

    // Hyperlink targets live in the document rels part
    const relTargets = {};
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (relsFile) {
        const relsXml = await relsFile.async('string');
        const relTags = relsXml.match(/<Relationship\b[^>]*>/g) || [];
        for (const tag of relTags) {
            const id = /\bId="([^"]+)"/.exec(tag);
            const target = /\bTarget="([^"]*)"/.exec(tag);
            if (id && target) relTargets[id[1]] = target[1];
        }
    }

    paragraphEls.forEach((pEl, i) => {
        const { text, segments } = collectParagraphSegments(pEl);
        lineStarts.push(fullText.length);
        fullText += text;
        if (i < paragraphEls.length - 1) fullText += '\n';

        const style = getPStyle(pEl);
        if (/^(Heading[1-9]|Title|Subtitle)/i.test(style)) headingLines.add(i);
        const hMatch = /^Heading([1-9])/i.exec(style);
        if (hMatch) headingLevels.set(i, parseInt(hMatch[1], 10));
        if (hasNumPr(pEl) || /^(ListParagraph|ListBullet|ListNumber)/i.test(style)) {
            listLines.add(i);
        }
        if (text.trim()) {
            if (paragraphToggle(segments, 'b')) boldLines.add(i);
            if (paragraphToggle(segments, 'i')) italicLines.add(i);
        }
        if (hasAncestor(pEl, 'tbl')) tableLines.add(i);

        const lineStart = lineStarts[i];

        // Hyperlinks: display text, position and target
        const hlinkEls = Array.from(pEl.getElementsByTagName('w:hyperlink'));
        for (const h of hlinkEls) {
            const tNodes = new Set(Array.from(h.getElementsByTagName('w:t')));
            const segs = segments.filter(s => s.kind === 't' && tNodes.has(s.tNode));
            if (segs.length === 0) continue;
            const startOff = Math.min(...segs.map(s => s.start));
            const endOff = Math.max(...segs.map(s => s.start + s.length));
            const rId = h.getAttribute('r:id');
            links.push({
                text: text.substring(startOff, endOff),
                position: lineStart + startOff,
                length: endOff - startOff,
                target: (rId && relTargets[rId]) || h.getAttribute('w:anchor') || '',
                line: i
            });
        }

        // Underlined runs that are not hyperlinks (merge adjacent runs)
        const pushURange = (r) => {
            const t = text.substring(r.startOff, r.endOff);
            if (t.trim()) {
                underlines.push({
                    text: t, position: lineStart + r.startOff,
                    length: r.endOff - r.startOff, line: i
                });
            }
        };
        let uRange = null;
        for (const seg of segments) {
            const underlined = seg.kind === 't' && seg.run &&
                toggleOn(getRPr(seg.run), 'u') &&
                !hasAncestor(seg.run, 'hyperlink', pEl);
            if (underlined) {
                if (uRange && uRange.endOff === seg.start) {
                    uRange.endOff = seg.start + seg.length;
                } else {
                    if (uRange) pushURange(uRange);
                    uRange = { startOff: seg.start, endOff: seg.start + seg.length };
                }
            } else if (uRange) {
                pushURange(uRange);
                uRange = null;
            }
        }
        if (uRange) pushURange(uRange);

        paragraphs.push({ el: pEl, text, segments });
    });

    return {
        zip, doc, paragraphs, fullText, lineStarts,
        headingLines, listLines, boldLines, italicLines, tableLines,
        headingLevels, links, underlines
    };
}

function locate(lineStarts, paragraphs, position) {
    let lo = 0, hi = lineStarts.length - 1, idx = 0;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lineStarts[mid] <= position) { idx = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return { paraIndex: idx, offset: position - lineStarts[idx] };
}

function splitRun(doc, run, tNode, at) {
    const text = tNode.textContent || '';
    const newRun = doc.createElementNS(W_NS, 'w:r');
    const rPr = getRPr(run);
    if (rPr) newRun.appendChild(rPr.cloneNode(true));

    const newT = doc.createElementNS(W_NS, 'w:t');
    newT.setAttribute('xml:space', 'preserve');
    newT.appendChild(doc.createTextNode(text.slice(at)));
    newRun.appendChild(newT);

    tNode.textContent = text.slice(0, at);
    tNode.setAttribute('xml:space', 'preserve');

    const tParent = tNode.parentNode;
    while (tParent === run && tNode.nextSibling) {
        newRun.appendChild(tNode.nextSibling);
    }
    run.parentNode.insertBefore(newRun, run.nextSibling);
    return newRun;
}

function makeCommentMarker(doc, name, id) {
    const el = doc.createElementNS(W_NS, 'w:' + name);
    el.setAttribute('w:id', String(id));
    return el;
}

// ---------------- Tracked changes (opt-in via options.trackChanges) ----------------

function makeRevisionEl(doc, name, id, author, date) {
    const el = doc.createElementNS(W_NS, 'w:' + name);
    el.setAttribute('w:id', String(id));
    el.setAttribute('w:author', author);
    el.setAttribute('w:date', date);
    return el;
}

/** True if the run holds only text-like content that is safe to delete. */
function runIsPlainText(run) {
    for (let c = run.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) {
            if ((c.textContent || '').trim()) return false;
            continue;
        }
        if (c.nodeType !== 1) continue;
        const n = localName(c);
        if (n !== 'rPr' && n !== 't' && n !== 'tab' && n !== 'br' &&
            n !== 'cr' && n !== 'noBreakHyphen' && n !== 'softHyphen' &&
            n !== 'lastRenderedPageBreak') {
            return false;
        }
    }
    return true;
}

/**
 * The sibling nodes from startRun to endRun inclusive, or null if anything
 * in between is not a plain text run (image, field, bookmark...). Null means
 * the caller falls back to a comment rather than risk a broken revision.
 */
function collectRunChain(startRun, endRun) {
    if (!startRun || !endRun) return null;
    if (startRun.parentNode !== endRun.parentNode) return null;
    const chain = [];
    let node = startRun;
    while (node) {
        if (node.nodeType === 3) {
            if ((node.textContent || '').trim()) return null;
            chain.push(node);
        } else if (node.nodeType === 1 && isW(node, 'r') && runIsPlainText(node)) {
            chain.push(node);
        } else {
            return null;
        }
        if (node === endRun) return chain;
        node = node.nextSibling;
    }
    return null;
}

/** Rename every w:t inside the element to w:delText (required inside w:del). */
function convertToDelText(doc, container) {
    const live = container.getElementsByTagName('w:t');
    const ts = [];
    for (let i = 0; i < live.length; i++) {
        ts.push(live.item ? live.item(i) : live[i]);
    }
    for (const t of ts) {
        const d = doc.createElementNS(W_NS, 'w:delText');
        d.setAttribute('xml:space', 'preserve');
        d.appendChild(doc.createTextNode(t.textContent || ''));
        t.parentNode.replaceChild(d, t);
    }
}

function makeTextRun(doc, rPr, text) {
    const run = doc.createElementNS(W_NS, 'w:r');
    if (rPr) run.appendChild(rPr.cloneNode(true));
    const t = doc.createElementNS(W_NS, 'w:t');
    t.setAttribute('xml:space', 'preserve');
    t.appendChild(doc.createTextNode(text));
    run.appendChild(t);
    return run;
}

/** True if document.xml already carries revisions (w:ins, w:del, moves). */
function hasExistingRevisions(doc) {
    const names = ['w:ins', 'w:del', 'w:moveFrom', 'w:moveTo'];
    for (const n of names) {
        if (doc.getElementsByTagName(n).length > 0) return true;
    }
    return false;
}

function makeCommentReferenceRun(doc, id) {
    const run = doc.createElementNS(W_NS, 'w:r');
    const rPr = doc.createElementNS(W_NS, 'w:rPr');
    const rStyle = doc.createElementNS(W_NS, 'w:rStyle');
    rStyle.setAttribute('w:val', 'CommentReference');
    rPr.appendChild(rStyle);
    run.appendChild(rPr);
    const ref = doc.createElementNS(W_NS, 'w:commentReference');
    ref.setAttribute('w:id', String(id));
    run.appendChild(ref);
    return run;
}

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function commentXml(id, paragraphsOfText, author, initials, date) {
    const paras = paragraphsOfText.map(t =>
        '<w:p><w:pPr><w:pStyle w:val="CommentText"/></w:pPr>' +
        '<w:r><w:t xml:space="preserve">' + escapeXml(t) + '</w:t></w:r></w:p>'
    ).join('');
    return '<w:comment w:id="' + id + '" w:author="' + escapeXml(author) +
        '" w:initials="' + escapeXml(initials) + '" w:date="' + date + '">' +
        paras + '</w:comment>';
}

export function commentTextFor(issue) {
    const rule = issue.rule || {};
    const lines = [];
    lines.push((rule.name || 'Style issue') + ': ' + (rule.description || ''));
    const suggestion = issue.suggestion || issue.autoFix;
    if (suggestion && suggestion !== issue.found) {
        // Quote real replacement text; leave instructions unquoted
        if (issue.autoFix === suggestion) {
            lines.push("Suggested change: '" + suggestion + "'");
        } else {
            lines.push('Suggested change: ' + suggestion);
        }
    }
    if (issue.note) lines.push(issue.note);
    if (rule.link) lines.push('Style Manual guidance: ' + rule.link);
    return lines.filter(Boolean);
}

export async function annotateDocx(loaded, issues, env, options) {
    const E = getEnv(env);
    const opts = options || {};
    const author = opts.author || 'Style Manual Check';
    const initials = opts.initials || 'SMC';
    const date = (opts.date || new Date().toISOString().replace(/\.\d+Z$/, 'Z'));
    const { zip, doc, paragraphs, lineStarts } = loaded;

    // Tracked changes are opt-in and never nest inside existing revisions:
    // if the document already carries any, everything falls back to comments.
    const revisionsPresent = opts.trackChanges ? hasExistingRevisions(doc) : false;
    const trackingEnabled = !!opts.trackChanges && !revisionsPresent;
    let revId = 1;
    let changeCount = 0;

    const byPara = new Map();
    for (const issue of issues) {
        if (typeof issue.position !== 'number') continue;
        let item = null;
        const plan = trackingEnabled ? issue.trackPlan : null;
        if (plan && plan.deleteText) {
            const { paraIndex, offset } = locate(lineStarts, paragraphs, plan.start);
            const para = paragraphs[paraIndex];
            const end = offset + plan.deleteText.length;
            // Re-check the text at the mapped offsets; on any mismatch the
            // issue quietly becomes a comment instead.
            if (offset >= 0 && end <= para.text.length &&
                para.text.slice(offset, end) === plan.deleteText) {
                item = { paraIndex, issue, start: offset, end, track: plan };
            }
        }
        if (!item) {
            if (!issue.found) continue;
            const { paraIndex, offset } = locate(lineStarts, paragraphs, issue.position);
            const para = paragraphs[paraIndex];
            const start = Math.max(0, Math.min(offset, para.text.length));
            const end = Math.min(start + issue.found.length, para.text.length);
            if (end <= start) continue;
            item = { paraIndex, issue, start, end, track: null };
        }
        if (!byPara.has(item.paraIndex)) byPara.set(item.paraIndex, []);
        byPara.get(item.paraIndex).push(item);
    }

    let nextId = 0;
    const existingCommentsFile = zip.file('word/comments.xml');
    let existingCommentsXml = null;
    if (existingCommentsFile) {
        existingCommentsXml = await existingCommentsFile.async('string');
        const idMatches = existingCommentsXml.match(/w:id="(\d+)"/g) || [];
        for (const m of idMatches) {
            const n = parseInt(m.replace(/\D/g, ''), 10);
            if (n >= nextId) nextId = n + 1;
        }
    }

    const newComments = [];
    const sortedParas = Array.from(byPara.keys()).sort((a, b) => a - b);

    for (const paraIndex of sortedParas) {
        const para = paragraphs[paraIndex];
        const items = byPara.get(paraIndex)
            .sort((a, b) => a.start - b.start || b.end - a.end);

        const accepted = [];
        for (const item of items) {
            const prev = accepted[accepted.length - 1];
            if (prev && item.start < prev.end) {
                if (item.start === prev.start && item.end === prev.end) {
                    prev.issues.push(item.issue);
                } else {
                    prev.merged.push(item.issue);
                }
                continue;
            }
            accepted.push({
                start: item.start, end: item.end,
                issues: [item.issue], merged: [], track: item.track
            });
        }

        for (let i = accepted.length - 1; i >= 0; i--) {
            const { start, end, issues: anchorIssues, merged, track } = accepted[i];

            const segs = para.segments.filter(s =>
                s.start < end && (s.start + s.length) > start);
            if (segs.length === 0) continue;

            const firstSeg = segs[0];
            const lastSeg = segs[segs.length - 1];

            let endRun = lastSeg.run;
            if (lastSeg.kind === 't' && end < lastSeg.start + lastSeg.length) {
                splitRun(doc, lastSeg.run, lastSeg.tNode, end - lastSeg.start);
                endRun = lastSeg.run;
            }

            let startRun = firstSeg.run;
            if (firstSeg.kind === 't' && start > firstSeg.start) {
                const suffixRun = splitRun(
                    doc, firstSeg.run, firstSeg.tNode, start - firstSeg.start);
                startRun = suffixRun;
                if (endRun === firstSeg.run) endRun = suffixRun;
            }

            // A range becomes a tracked change only when exactly one issue
            // owns it (overlaps stay comments) and the runs are safe to wrap.
            if (track && anchorIssues.length === 1 && merged.length === 0) {
                const chain = collectRunChain(startRun, endRun);
                if (chain) {
                    const del = makeRevisionEl(doc, 'del', revId++, author, date);
                    startRun.parentNode.insertBefore(del, startRun);
                    for (const node of chain) del.appendChild(node);
                    convertToDelText(doc, del);
                    if (track.insertText) {
                        const firstRun = chain.find(n => n.nodeType === 1);
                        const ins = makeRevisionEl(doc, 'ins', revId++, author, date);
                        ins.appendChild(makeTextRun(
                            doc, getRPr(firstRun), track.insertText));
                        del.parentNode.insertBefore(ins, del.nextSibling);
                    }
                    anchorIssues[0].trackApplied = true;
                    changeCount++;
                    continue;
                }
                // Runs too complex to wrap safely - fall through to a comment.
            }

            for (let k = 0; k < anchorIssues.length; k++) {
                const id = nextId++;
                startRun.parentNode.insertBefore(
                    makeCommentMarker(doc, 'commentRangeStart', id), startRun);
                const endMarker = makeCommentMarker(doc, 'commentRangeEnd', id);
                endRun.parentNode.insertBefore(endMarker, endRun.nextSibling);
                endMarker.parentNode.insertBefore(
                    makeCommentReferenceRun(doc, id), endMarker.nextSibling);

                let textParas = commentTextFor(anchorIssues[k]);
                if (k === 0 && merged.length > 0) {
                    for (const m of merged) {
                        textParas = textParas.concat(
                            ['Also flagged in this text:'],
                            commentTextFor(m));
                    }
                }
                newComments.push(commentXml(
                    id, textParas, author, initials, date));
            }
        }
    }

    if (newComments.length > 0) {
        if (existingCommentsXml) {
            const updated = existingCommentsXml.replace(
                /<\/w:comments>\s*$/,
                newComments.join('') + '</w:comments>');
            zip.file('word/comments.xml', updated);
        } else {
            const commentsDoc =
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<w:comments xmlns:w="' + W_NS + '">' +
                newComments.join('') + '</w:comments>';
            zip.file('word/comments.xml', commentsDoc);
            await ensureContentType(zip);
            await ensureRelationship(zip);
        }
    }

    const serializer = new E.XMLSerializer();
    let outXml = serializer.serializeToString(doc);
    if (!outXml.startsWith('<?xml')) {
        outXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + outXml;
    }
    zip.file('word/document.xml', outXml);
    return {
        zip,
        commentCount: newComments.length,
        changeCount,
        revisionsPresent
    };
}

async function zipString(zip, path) {
    const f = zip.file(path);
    return f ? f.async('string') : '';
}

async function ensureContentType(zip) {
    let ct = await zipString(zip, '[Content_Types].xml');
    if (ct.indexOf('word/comments.xml') !== -1) return;
    ct = ct.replace('</Types>',
        '<Override PartName="/word/comments.xml" ContentType="' +
        COMMENTS_CT + '"/></Types>');
    zip.file('[Content_Types].xml', ct);
}

async function ensureRelationship(zip) {
    const path = 'word/_rels/document.xml.rels';
    let rels = await zipString(zip, path);
    if (rels.indexOf(COMMENTS_REL) !== -1) return;
    let n = 1000;
    while (rels.indexOf('Id="rId' + n + '"') !== -1) n++;
    if (rels) {
        rels = rels.replace('</Relationships>',
            '<Relationship Id="rId' + n + '" Type="' + COMMENTS_REL +
            '" Target="comments.xml"/></Relationships>');
    } else {
        rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
            '<Relationships xmlns="' + REL_NS + '">' +
            '<Relationship Id="rId' + n + '" Type="' + COMMENTS_REL +
            '" Target="comments.xml"/></Relationships>';
    }
    zip.file(path, rels);
}
