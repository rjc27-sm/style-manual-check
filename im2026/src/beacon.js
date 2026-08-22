/**
 * Proof Positive (IM2026) - page counter
 *
 * Adds one anonymous count per page load, so the reach of the tool can be
 * reported. Check a document runs entirely in the browser and never calls the
 * Worker, so without this the tool's main feature would be invisible in any
 * usage figures.
 *
 * What is sent: the page name, and the hostname of whatever linked you here.
 * That is all. No text, no file names, nothing about the document being
 * checked, and nothing is stored on the device - no cookies and no local
 * storage, which is what makes a returning visitor uncountable by design.
 * The Worker adds the country, state and network name from the connection
 * itself; see record() in ../worker/worker.js.
 *
 * Fire and forget. The response is never read and every failure is silent:
 * counting a page load must never be able to break the page.
 */

import { WORKER_URL } from './ai.js';

/** The page name, from the file name: 'index', 'ask', 'lists' and so on. */
function pageName() {
    const last = location.pathname.split('/').pop() || 'index.html';
    return last.replace(/\.html?$/i, '').replace(/[^a-z0-9_-]/gi, '') || 'index';
}

/**
 * Only the referring HOSTNAME, never the full URL - a referrer URL can carry a
 * query string, and that is somebody else's data. Our own pages are dropped, so
 * this answers 'what linked them here' rather than 'where did they click next'.
 */
function referrerHost() {
    if (!document.referrer) return '';
    try {
        const host = new URL(document.referrer).hostname;
        return host === location.hostname ? '' : host;
    } catch {
        return '';
    }
}

function countPageView() {
    if (!WORKER_URL) return;
    // Honour the browser's own privacy signals, and skip automated loads:
    // a crawler or a prerender is not a reader.
    const n = navigator;
    if (n.doNotTrack === '1' || n.globalPrivacyControl || n.webdriver) return;
    if (document.visibilityState === 'prerender') return;

    const ref = referrerHost();
    // Query string, not a body: that keeps this a CORS-simple request, so it
    // costs ONE request per page load rather than a preflight and then a POST.
    const url = WORKER_URL + '/api/beacon?p=' + encodeURIComponent(pageName()) +
        (ref ? '&r=' + encodeURIComponent(ref) : '');

    try {
        // sendBeacon survives a fast click away from the page; keepalive is the
        // fallback for anything that does not have it.
        if (!(n.sendBeacon && n.sendBeacon(url))) {
            fetch(url, { method: 'POST', keepalive: true, mode: 'no-cors' })
                .catch(() => {});
        }
    } catch {
        // Never let a counter surface as an error to the reader.
    }
}

countPageView();
