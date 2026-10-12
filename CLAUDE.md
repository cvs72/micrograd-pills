# micrograd-pills
Read README.md first. The pills are short animated web pages (HTML/CSS/JS, Three.js r128), one idea each; the
trained digit network is the running example and every on-screen number comes from `src/digits/*.py`. The design files
in `design/` are edited only with the owner's explicit yes. Build with `node build.js`; preview `site/` on 127.0.0.1.
Secrets live only in `.env` (gitignored; placeholders in `.env.example`), never in a tracked file. The repo is
public: no emails, hostnames, machine paths or personal data in tracked files, with one deliberate exception, the
developer's credit: `cvs72` (handle, lowercase; `cvs_72` on some sites) and the name Carlos Val Souto in LICENSE and
in the site footer's hover bubble. `./publish-check.sh` must pass before any push. `reference/transcript.md` stays
untracked. Micrograd is a complete autograd engine at its smallest expression: call it micrograd or the tiny engine,
never a toy.
