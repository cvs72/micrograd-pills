# micrograd-pills
Read README.md first. The pills are short animated web pages (HTML/CSS/JS, Three.js r128), one idea each; the
trained digit network is the running example and every on-screen number comes from `src/digits/*.py`. The design files
in `design/` are edited only with the owner's explicit yes. Build with `node build.js`; preview `site/` on 127.0.0.1.
Secrets live only in `.env` (gitignored; placeholders in `.env.example`), never in a tracked file. The repo will be
public: no personal names, emails, hostnames or machine paths in tracked files; `./publish-check.sh` must pass before
any push. Micrograd is a complete autograd engine at its smallest expression: call it micrograd or the tiny engine,
never a toy.
