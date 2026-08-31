# Harness starter — free green layers as GitHub Actions

Ready-to-use CI that switches on the **free "green" (extrinsic) error-correction
layers** of the [Harness Inventory](https://llm-coding.github.io/Semantic-Anchors/harness-inventory)
with almost no project-specific config. This is the *pragmatic minimum* as code:
turn these on and you stop paying LLM tokens to chase errors a free tool would have caught.

## Install

```sh
cp harness-starter.yml  <your-repo>/.github/workflows/harness.yml
cp dependabot.yml        <your-repo>/.github/dependabot.yml
```

Then adjust the two spots the tools cannot guess:
- **CodeQL** — set `matrix.language` to your language(s).
- **Dependabot / Trivy** — set your package ecosystem(s).

Jobs start **non-blocking** so nothing breaks on day one. To make a check blocking
once it is clean: for `trivy` flip `exit-code: '1'`, for `link-check` flip
`fail: true`, and for `secret-scan` / `spell-check` / `markdown-lint` remove their
`continue-on-error: true` line.

## What it covers on the wheel

| Job | Tool | Wheel aspects |
|-----|------|---------------|
| secret-scan | gitleaks | Secret scanning |
| trivy | Trivy (fs) | SCA · Container/image scanning · IaC scanning · Supply chain/SBOM |
| codeql | CodeQL | SAST |
| link-check | lychee | Link checker |
| spell-check | typos | Spell check |
| markdown-lint | markdownlint | Markdown / AsciiDoc lint |
| dependabot | Dependabot | SCA · Supply chain |
| a11y (optional) | Lighthouse CI | Accessibility automated |

That is ~9 of the wheel's layers from one paste (10 with the optional a11y job) —
matching the **"GH Actions starter"** tool preset in the coverage wheel.

> ⚠️ These job choices and the layer mapping are **LLM-generated suggestions**.
> They are a sensible starting point, not gospel — pin action versions, review
> permissions, and adapt to your stack before relying on them.
