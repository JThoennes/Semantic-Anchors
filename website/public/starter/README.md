# Harness starter — free green layers as GitHub Actions

Ready-to-use CI that switches on the **free "green" (extrinsic) error-correction
layers** of the [Harness Inventory](https://llm-coding.github.io/Semantic-Anchors/harness-inventory)
with almost no project-specific config. This is the *pragmatic minimum* as code:
turn these on and you stop paying LLM tokens to chase errors a free tool would have caught.

## Install

```
cp harness-starter.yml  <your-repo>/.github/workflows/harness.yml
cp dependabot.yml        <your-repo>/.github/dependabot.yml
```

Then adjust the two spots the tools cannot guess:
- **CodeQL** — set `matrix.language` to your language(s).
- **Dependabot / Trivy** — set your package ecosystem(s).

Jobs start **non-blocking** so nothing breaks on day one. Flip `exit-code: '1'` /
`fail: true` once each is clean.

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

That is ~10 of the wheel's layers from one paste — matching the **"GH Actions starter"**
tool preset in the coverage wheel.

> ⚠️ These job choices and the layer mapping are **LLM-generated suggestions**.
> They are a sensible starting point, not gospel — pin action versions, review
> permissions, and adapt to your stack before relying on them.
