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

## Adding a skill

1. Create the directory and manifest:

   ```text
   skills/<name>/
   ├── SKILL.md
   ├── scripts/        # optional
   └── references/     # optional
   ```

   `SKILL.md` must start with YAML frontmatter:

   ```yaml
   ---
   name: <name>
   description: >-
     One or two sentences describing when the agent should use this skill.
     Include trigger words in the languages the user actually speaks.
   ---
   ```

2. Follow the naming rules:
   - Directory name: English kebab-case, and identical to the skill name.
   - The directory name becomes the install directory, so it must be unique
     across all CC Switch repositories. A conflict with another repository is
     rejected, not merged.
   - Do not put a second `SKILL.md` anywhere below the skill directory. CC
     Switch stops scanning at the first one.

3. Keep the skill self-contained. Everything it needs at runtime should live
   under its own directory; do not reference files in another skill.

4. Never hardcode secrets or machine-specific endpoints. Add the variable to
   `env.example` and read it at runtime (see
   [Environment management](#environment-management)).

5. Test before publishing. At minimum, check that `SKILL.md` parses and that
   any script runs from an arbitrary working directory:

   ```bash
   cd ~/code/favour-config
   git diff --check
   git grep -nE 'sk-[A-Za-z0-9]{20,}|/Users/[A-Za-z]|BEGIN (RSA|OPENSSH|PRIVATE)'
   ```

6. Commit and push to `main`:

   ```bash
   git add skills/<name>
   git commit -m "skill: add <name>"
   git push
   ```

7. Install it through CC Switch (see [Install with CC Switch](#install-with-cc-switch)).
   New skills show up in the repository's available list; they are not
   installed automatically.

8. If the skill should be available inside the note repository without a
   global install, add its name to the appropriate array in
   `~/note/scripts/link-project-skills.sh` and run that script.

### Skill checklist

- [ ] `skills/<name>/SKILL.md` with `name` and a trigger-rich `description`
- [ ] No secrets, internal hostnames, personal paths, or internal IDs
- [ ] Runtime dependencies documented in `SKILL.md`
- [ ] New variables added to `env.example` with a comment
- [ ] Tested from a directory outside the repository
- [ ] Committed and pushed to `main`
- [ ] Installed/enabled in CC Switch, or added to the note project's link manifest

## Changing or removing a skill

CC Switch installs a **copy** of the skill under `~/.cc-switch/skills/`. The
copy only changes when you run **Check updates** in CC Switch, so publishing
and installing are two separate steps:

| Change | Steps |
|---|---|
| Edit an existing skill | Edit `skills/<name>/` → commit → push → CC Switch **Check updates** → update |
| Add a new skill | Follow [Adding a skill](#adding-a-skill) → install in CC Switch |
| Rename a skill | Add the new directory → push → install/update it → uninstall the old name in CC Switch → update the note link manifest |
| Remove a skill | Delete `skills/<name>/` → commit → push → uninstall it in CC Switch → remove it from the note link manifest |

Notes:

- Do **not** edit `~/.cc-switch/skills/<name>/` for anything you want to keep:
  the next update replaces the whole directory.
- For quick local iteration, edit the working tree and use the project-scoped
  symlinks in a repository (they point at `favour-config/skills/` directly).
  Publish once the behavior is settled.
- Do not commit `__pycache__/`, `.env`, or other generated files; the root
  `.gitignore` already covers the common cases.
- The note repository pins a submodule commit. After pushing here, run
  `note-sync`, or update it manually:

  ```bash
  cd ~/note
  git submodule update --remote favour-config
  git add favour-config
  git commit -m "chore: bump favour-config"
  ```

  The project-level symlinks follow the submodule's working tree, so they see
  the new content as soon as the submodule is updated.

## Skills

| Skill | Purpose |
|---|---|
| `daily-note` | Daily journal records under `日记/` |
| `english-mode` | English-learning loop inside the note vault |
| `maintain-note` | Merge, split, rename, and maintain notes |
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

## Environment management

Secrets and machine-specific endpoints live in exactly one place per machine:

```text
~/.config/favour-config/env
```

The file is outside the repository, is never committed, and has mode `0600`.
`env.example` is the **registry of variable names** and the only environment
file tracked by git.

Set up a new machine with:

```bash
mkdir -p -m 700 ~/.config/favour-config
cp env.example ~/.config/favour-config/env
chmod 600 ~/.config/favour-config/env
# then fill in the values this machine needs
```

### Rules

- Every key is declared in `env.example` with a comment saying who uses it.
  Keys that are optional stay commented out or empty.
- The real value is only ever written to `~/.config/favour-config/env`.
  It does not belong in `SKILL.md`, scripts, commit messages, shell history,
  issues, or screenshots.
- Skills must not contain hardcoded fallbacks for secrets or internal hosts.
  If a value is missing, fail with a message naming the key and the env file.
- `FAVOUR_CONFIG_ENV` overrides the env-file path in the Python helpers
  (`paper-reader`, `wxmp-article-harvester`).
- Lookup order is implementation-specific, by design:

  | Consumer | Lookup |
  |---|---|
  | `paper-reader/scripts/mineru_api.py` | CLI argument → process env → env file |
  | `wxmp-article-harvester/scripts/runtime_paths.py` | process env → env file (file only fills unset keys) |

### Current variables

| Variable | Used by | Required | Meaning |
|---|---|---|---|
| `MINERU_TOKEN` | `paper-reader` | yes | MinerU Cloud API token |
| `METASO_API_KEY` | `wxmp-article-harvester` | no | Metaso full-text fallback (paid) |
| `WXMP_HARVEST_HOME` | `wxmp-article-harvester` | no | Override the export/profile directory |

### Adding a variable

1. Add `KEY=` plus a one-line comment to `env.example`.
2. Read it in the skill at runtime, with no hardcoded value. On missing input,
   print the key name and the env-file path, then exit non-zero.
3. Add it to the table above and to the skill's own "本机配置" section.
4. Add the real value to `~/.config/favour-config/env` on each machine that
   needs it. Machines that do not use the skill can leave it empty.
5. Commit only `env.example`. Confirm with `git status` and a secret scan
   before pushing.

### Rotating a value

Update the value in your local env file and in the issuing service; no code
change is needed. If a value was ever committed or pasted into a shared
channel, rotate it first, then rewrite or discard the exposed copy. Git history
in this repository is public, so assume anything pushed is permanent.

## Install with CC Switch

CC Switch only supports **public GitHub** skill repositories and downloads
them anonymously, so this repository must stay public and this workflow must
never depend on private credentials.

1. Open **CC Switch → Skills → Repositories**.
2. Add `Aliancn/favour-config`, branch `main`.
3. Install the skills you want and enable them per app (Claude Code, OpenCode,
   and so on). Enabling is per app; installing does not enable anything.
4. CC Switch stores the installed copy under `~/.cc-switch/skills/` and
   symlinks it into each app's skill directory using `skillSyncMethod: auto`.
5. On other machines, repeat steps 1–3. The env file from
   [Environment management](#environment-management) is per machine and must
   be recreated there.

Publishing and updating are separate:

```bash
cd ~/code/favour-config
# edit skills/<name>/...
git add -A && git commit -m "update <name>" && git push
```

Then run **Check updates** in CC Switch and update the skill. Until you do,
the installed copy under `~/.cc-switch/skills/` is unchanged. Do not edit that
copy directly: the next update replaces it.

Skills that exist only on this machine (`anysearch`, `typst`) are managed by
CC Switch as local skills and are intentionally not part of this repository.

Project-scoped links (for example `note/.opencode/skills/`) are not managed by
CC Switch. They are created by the note repository's own
`scripts/link-project-skills.sh`, which points them at
`note/favour-config/skills/`.

## Security notes

This repository is public. Before every push:

```bash
git status
git grep -nE 'sk-[A-Za-z0-9]{20,}|/Users/[A-Za-z]|BEGIN (RSA|OPENSSH|PRIVATE)' \
  || echo "no obvious secrets"
git log --all -S'<old-secret-fragment>'
# also grep for the internal domains and IDs you know about, locally only
```

- Keep `~/.config/favour-config/env` at mode `0600` and the directory at `0700`.
- Never commit `.env`, tokens, cookies, internal hostnames, or internal IDs.
  Git history is permanent; if something leaks, rotate it rather than trying to
  hide it.
- Some skills are third-party or adapted from third-party projects; keep their
  original license/attribution when editing them.
