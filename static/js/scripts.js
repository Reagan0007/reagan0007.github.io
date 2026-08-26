/*!
 * Site bootstrap.
 *
 * Each language is its own page (/en/ and /zh/), so the language is fixed at
 * load time — it is read from the <html lang> attribute, not chosen at runtime.
 * The switch in the navbar is a plain link to the other page.
 *
 * Content lives in /contents/<lang>/ :
 *   config.yml   -> injected by id, e.g. `nav-home: HOME` fills #nav-home
 *   <section>.md -> rendered as markdown into #<section>-md
 *
 * To add a section: create the .md file in BOTH /contents/en and /contents/zh,
 * add its name to SECTIONS, and add a matching #<name>-md container to BOTH
 * /en/index.html and /zh/index.html.
 */

const CONTENT_DIR = '/contents/';
const CONFIG_FILE = 'config.yml';
const SECTIONS = ['home', 'experience', 'projects', 'awards'];

const LANG_STORAGE_KEY = 'reagan-site-lang';

// 'zh-CN' -> 'zh', 'en' -> 'en'. Drives which content folder is loaded.
const PAGE_LANG = (document.documentElement.lang || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';


/** Remember this page's language so the root selector can honour it next visit. */
function rememberLang(lang) {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
        // Storage can be blocked (private mode, cookies off). Non-fatal:
        // the root page just falls back to browser-language detection.
    }
}


/** Decode HTML entities (config values may contain &ensp;, &copy;, ...). */
function decodeEntities(html) {
    const el = document.createElement('textarea');
    el.innerHTML = html;
    return el.value;
}


/** Apply config.yml: every top-level key fills the element with that id. */
function applyConfig(yml) {
    Object.keys(yml).forEach(key => {
        const value = String(yml[key]);
        if (key === 'title') {
            // <title> must be plain text, not markup.
            document.title = decodeEntities(value);
            return;
        }
        const el = document.getElementById(key);
        if (el) {
            el.innerHTML = value;
        } else {
            console.warn('config.yml key has no matching element id: ' + key);
        }
    });
}


function typesetMath() {
    // MathJax is loaded async and may not be ready on first paint.
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise().catch(err => console.log(err));
    }
}


/** Fetch and render the config plus every section for this page's language. */
function loadContent() {
    const base = CONTENT_DIR + PAGE_LANG + '/';

    const config = fetch(base + CONFIG_FILE)
        .then(response => {
            if (!response.ok) throw new Error(base + CONFIG_FILE + ': ' + response.status);
            return response.text();
        })
        .then(text => applyConfig(jsyaml.load(text)))
        .catch(error => console.error(error));

    const sections = SECTIONS.map(name =>
        fetch(base + name + '.md')
            .then(response => {
                if (!response.ok) throw new Error(base + name + '.md: ' + response.status);
                return response.text();
            })
            .then(markdown => {
                const container = document.getElementById(name + '-md');
                if (container) container.innerHTML = marked.parse(markdown);
            })
            .catch(error => console.error(error))
    );

    return Promise.all([config, ...sections]).then(() => {
        typesetMath();
        // Section heights changed, so the scrollspy offsets are stale.
        const spy = bootstrap.ScrollSpy.getInstance(document.body);
        if (spy) spy.refresh();
    });
}


window.addEventListener('DOMContentLoaded', () => {

    rememberLang(PAGE_LANG);

    // Activate Bootstrap scrollspy on the main nav element
    if (document.body.querySelector('#mainNav')) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    document.querySelectorAll('#navbarResponsive .nav-link').forEach(navItem => {
        navItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    marked.use({ mangle: false, headerIds: false });

    loadContent();
});
