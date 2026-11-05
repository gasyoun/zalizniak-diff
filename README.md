Zalizniak preprint diff — editorial working document

## Maintenance automation

Dependency updates for GitHub Actions run via Dependabot (ecosystem `github-actions`): update PRs open weekly Monday 08:00 Europe/Moscow, up to 5 at a time; every non-major bump is auto-approved and squash-merged once checks pass (`.github/workflows/dependabot-auto-merge.yml`), while semver-major bumps stay open for human review (config: `.github/dependabot.yml`).
