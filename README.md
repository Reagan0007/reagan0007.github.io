# reagan0007.github.io

Personal homepage of **Reagan Li (李根)** — M.S. in Finance, Southern University of Science and Technology.

- English: <https://reagan0007.github.io/en/>
- 中文: <https://reagan0007.github.io/zh/>

The root URL forwards to whichever matches the visitor.

## Layout

```
index.html            language selector — redirects to /en/ or /zh/
en/index.html         English page
zh/index.html         中文页面
contents/
  en/                 English content
    config.yml        UI labels — each key fills the element with that id
    home.md           bio, education, skills, certifications
    experience.md     internships
    projects.md       research projects
    awards.md         competitions and honors
  zh/                 中文内容 (same five files)
static/
  assets/pdf/         resume PDFs and paper/competition attachments
  assets/img/         photo and background images
  css/main.css        site styling (styles.css is vendored Bootstrap)
  js/scripts.js       content loading
```

All in-page paths are root-absolute (`/static/...`, `/contents/...`) because the
pages live one directory down.

## Editing

Static site, no build step. Edit and push to `main`; GitHub Pages redeploys in
about a minute.

- **Changing text** — edit the `.md` files or `config.yml` under `contents/<lang>/`.
  Nothing else needs to change.
- **Adding a section** — create the `.md` in **both** `contents/en/` and
  `contents/zh/`, add its name to `SECTIONS` in `static/js/scripts.js`, and add a
  matching `<div class="main-body" id="<name>-md">` to **both** `en/index.html`
  and `zh/index.html`.
- **Swapping the resume PDF** — replace `static/assets/pdf/Reagan_Li_CV_CN.pdf`
  or `..._EN.pdf`. The links do not change.

The two page files are structurally identical; only the `<head>` metadata and the
hardcoded fallback labels differ. Keep them in sync when changing structure.

## Language handling

Each language is a separate URL so both can be indexed independently, with
`hreflang` alternates and per-language `og:` tags. The switch at the top right is
a plain link between them.

The root selector picks a target in this order:

1. `?lang=zh` / `?lang=en` in the URL (also keeps pre-split links working)
2. the visitor's previous choice (`localStorage`)
3. the browser's preferred language
4. English

Body typography is tuned per language via `html[lang^="zh"]` rules in
`main.css` — CJK faces have no ExtraLight weight and need more leading than
Latin, so size, weight, line-height and tracking all differ.

## Credits

Built on the open-source academic homepage template by
[Sen Li](https://github.com/senli1073/academic-homepage-template), MIT licensed.

Template code is under the MIT license (see [LICENSE](LICENSE)).
Site content — text, images and documents under `contents/` and `static/assets/` —
is © Reagan Li and not covered by that license.
