# favour-config

Personal skill library. The repository is consumed by
[CC Switch](https://github.com/farion1231/cc-switch) as a public skill
repository, so the same skills can be installed and enabled per app
(Claude Code, OpenCode, and others) on every machine.

## Layout

```text
favour-config/
├── env.example              # template for machine-local secrets
├── skills/
│   ├── daily-note/
│   │   └── SKILL.md
│   ├── paper-reader/
│   │   ├── SKILL.md
│   │   └── scripts/
│   └── ...
└── README.md
```

Every skill is a directory under `skills/` containing a `SKILL.md` and,
optionally, scripts or references. CC Switch scans the repository recursively,
so no extra manifest is needed.

## Skills

| Skill | Purpose |
|---|---|
| `daily-note` | Daily journal records under `日记/` |
| `english-mode` | English-learning loop inside the note vault |
| `maintain-note` | Merge, split, rename, and maintain notes |
| `md2citadel` | Sync Markdown to an internal document platform (Citadel) |
| `openreview` | Search and download papers from OpenReview |
| `overleaf-skill` | Manage Overleaf projects with `olcli` |
| `paper-reader` | Deep paper reading with MinerU PDF parsing |
| `paperscool` | Browse papers from papers.cool |
| `pdf` | Local PDF text/table extraction |
| `quarkdown` | Author and compile Quarkdown documents |
| `search-note` | Search and query the note vault |
| `terms` | Record terminology conventions in `TERMS.md` |
| `write-note` | Create and classify notes |
| `wxmp-article-harvester` | Harvest public WeChat article archives |
| `wxmp-to-blog` | Convert a WeChat article into an Astro blog post |
| `xuecheng` | Search an internal document platform (Citadel) |

## Local configuration

Secrets and machine-specific endpoints are **never** committed. Copy the
template once per machine:

```bash
mkdir -p ~/.config/favour-config
cp env.example ~/.config/favour-config/env
chmod 600 ~/.config/favour-config/env
```

Fill in only the values you need. Scripts look them up in this order:

1. explicit CLI argument (where supported);
2. process environment;
3. `~/.config/favour-config/env` (override the path with `FAVOUR_CONFIG_ENV`).

Markdown-only skills that need internal endpoints (`xuecheng`,
`md2citadel`) instruct the agent to load the same file with:

```bash
set -a; . ~/.config/favour-config/env; set +a
```

## Install with CC Switch

1. Open **CC Switch → Skills → Repositories**.
2. Add `Aliancn/favour-config`, branch `main`.
3. Install the skills you want and enable them per app.
4. CC Switch stores the installed copy under `~/.cc-switch/skills/` and
   symlinks it into the app skill directories.

To publish a change:

```bash
cd ~/code/favour-config
# edit skills/<name>/...
git add -A && git commit -m "update <name>" && git push
```

Then run **Check updates** in CC Switch and update the skill. Do not edit the
copy under `~/.cc-switch/skills/` directly: the next update replaces it.

Project-scoped links (for example `note/.opencode/skills/`) are not managed by
CC Switch. They are created by the note repository's own
`scripts/link-project-skills.sh`.

## Security notes

- Run `git status` and a secret scan before every push.
- Keep `~/.config/favour-config/env` at mode `0600`.
- Some skills are third-party or adapted from third-party projects; keep their
  original license/attribution when editing them.
