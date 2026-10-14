# HyperFrames setup (cloud sessions)

HyperFrames skills live in `.claude/skills/` (installed from `heygen-com/hyperframes`, pinned in `skills-lock.json`). Start with `/hyperframes`.

- The CLI runs via `npx hyperframes ...` (Node 22+). Each new container needs Chrome for rendering: run `npx hyperframes browser ensure` once before `render`.
- This environment's network blocks public CDNs (cdn.jsdelivr.net, unpkg.com, cdnjs). Install runtime libraries (e.g. GSAP) from npm and reference them as local files in the composition instead of CDN URLs, or the render fails with `sub_timeline_script_failure`.
- Refresh skills with `npx skills add heygen-com/hyperframes --skill '*' --agent claude-code --copy -y` (project scope; `npx hyperframes skills update` installs globally, which is lost when the container resets).
