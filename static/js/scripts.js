/*!
 * Site bootstrap: bilingual (zh / en) content loading.
 *
 * Content lives in contents/<lang>/ :
 *   config.yml   -> injected by id, e.g. `nav-home: HOME` fills #nav-home
 *   <section>.md -> rendered as markdown into #<section>-md
 *
 * To add a section: create the .md file in BOTH contents/en and contents/zh,
 * add its name to SECTIONS, and add a matching #<name>-md container in index.html.
 */

const CONTENT_DIR = 'contents/';
const CONFIG_FILE = 'config.yml';
const SECTIONS = ['home', 'experience', 'projects', 'awards'];

const SUPPORTED_LANGS = ['en', 'zh'];
const DEFAULT_LANG = 'en';
const LANG_STORAGE_KEY = 'reagan-site-lang';

// Bumped on every language switch so that a slow response from a previously
// selected language cannot overwrite the content of the current one.
let renderToken = 0;


/**
 * Resolve the language to show, in order of precedence:
 * ?lang= query param > previously saved choice > browser language > default.
 */
function resolveInitialLang() {
    const fromQuery = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED_LANGS.includes(fromQuery)) return fromQuery;

    let saved = null;
    try {
        saved = localStorage.getItem(LANG_STORAGE_KEY);
    } catch (e) {
        // localStorage can throw when cookies/storage are blocked; fall through.
    }
    if (SUPPORTED_LANGS.includes(saved)) return saved;

    const browserLangs = navigator.languages || [navigator.language || ''];
    if (browserLangs.some(l => (l || '').toLowerCase().startsWith('zh'))) return 'zh';

    return DEFAULT_LANG;
}


function rememberLang(lang) {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
        // Non-fatal: the choice just won't persist across visits.
    }
}


/** Decode HTML entities (config values may contain &ensp;, &copy;, ...). */
function decodeEntities(html) {
    const el = document.createElement('textarea');
    el.innerHTML = html;
    return el.value;
}


/** Apply contents/<lang>/config.yml: every top-level key fills the element of that id. */
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


/** Highlight the active button in the language switch. */
function syncLangSwitch(lang) {
    document.querySelectorAll('.lang-switch button[data-lang]').forEach(btn => {
        btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
}


function typesetMath() {
    // MathJax is loaded async and may not be ready on first paint.
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise().catch(err => console.log(err));
    }
}


/** Fetch and render every section plus the config for one language. */
function loadLanguage(lang) {
    const token = ++renderToken;
    const base = CONTENT_DIR + lang + '/';

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    syncLangSwitch(lang);

    const config = fetch(base + CONFIG_FILE)
        .then(response => {
            if (!response.ok) throw new Error(base + CONFIG_FILE + ': ' + response.status);
            return response.text();
        })
        .then(text => {
            if (token !== renderToken) return;
            applyConfig(jsyaml.load(text));
        })
        .catch(error => console.error(error));

    const sections = SECTIONS.map(name =>
        fetch(base + name + '.md')
            .then(response => {
                if (!response.ok) throw new Error(base + name + '.md: ' + response.status);
                return response.text();
            })
            .then(markdown => {
                if (token !== renderToken) return;
                const container = document.getElementById(name + '-md');
                if (container) container.innerHTML = marked.parse(markdown);
            })
            .catch(error => console.error(error))
    );

    return Promise.all([config, ...sections]).then(() => {
        if (token !== renderToken) return;
        typesetMath();
        // Section heights changed, so the scrollspy offsets are stale.
        const spy = bootstrap.ScrollSpy.getInstance(document.body);
        if (spy) spy.refresh();
    });
}


window.addEventListener('DOMContentLoaded', () => {

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

    // Language switch
    document.querySelectorAll('.lang-switch button[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (btn.getAttribute('aria-pressed') === 'true') return;
            rememberLang(lang);
            loadLanguage(lang);
        });
    });

    loadLanguage(resolveInitialLang());
});
