# reagan0007.github.io

Personal homepage of **Reagan Li (李根)** — M.S. in Finance, Southern University of Science and Technology.

Live at **<https://reagan0007.github.io/>**

## Editing the site

The site is static: no build step, no server. Edit the content files and push to `main`;
GitHub Pages redeploys within about a minute.

```
contents/
  en/                 English version
    config.yml        UI labels — each key fills the element with that id
    home.md           bio, education, skills, certifications
    experience.md     internships
    projects.md       research projects
    awards.md         competitions and honors
  zh/                 中文版本 (same five files)
static/
  assets/pdf/         resume PDFs and paper/competition attachments
  assets/img/         photo and background images
  css/main.css        site styling (styles.css is vendored Bootstrap)
  js/scripts.js       content loading and language switching
```

Both language folders must contain the same file names. To add a section, create the
`.md` file in **both** folders, add its name to `SECTIONS` in `static/js/scripts.js`,
and add a matching `<div id="<name>-md">` container in `index.html`.

## Language switching

The switch sits at the top right of the navbar. Language is resolved in this order:

1. `?lang=zh` / `?lang=en` in the URL
2. the visitor's previous choice (`localStorage`)
3. the browser's preferred language
4. English

Switching re-renders in place — no page reload, no separate URLs.

## Credits

Built on the open-source academic homepage template by
[Sen Li](https://github.com/senli1073/academic-homepage-template), MIT licensed.

Template code is under the MIT license (see [LICENSE](LICENSE)).
Site content — text, images and documents under `contents/` and `static/assets/` —
is © Reagan Li and not covered by that license.
