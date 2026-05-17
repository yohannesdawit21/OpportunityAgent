# Stitch reference — OpportunityAgent

**Project:** OpportunityAgent AI Career Assistant  
**Project ID:** `3374957064951637134`

## Files

| Stitch screen | Screen ID | HTML | Screenshot |
|---------------|-----------|------|------------|
| Intake & Onboarding | `3be25b259f724bf88ff24e63654963b0` | `intake-onboarding.html` | `intake-onboarding.png` |
| AI Scanning State | `c17ffa12d3124cacb1e9dd222c101d47` | `ai-scanning-state.html` | `ai-scanning-state.png` |
| Matched Opportunities | `2b0151e48d5f48fc9f3f1f10dcd85748` | `matched-opportunities.html` | `matched-opportunities.png` |
| Application Helper | `47e9f3b6d9514813b4e89893ea622ca4` | `application-helper.html` | `application-helper.png` |

Also: `design-theme.json`, `manifest.json`

## Re-download

```bash
chmod +x frontend/scripts/fetch-stitch.sh
./frontend/scripts/fetch-stitch.sh
```

## MCP tools used

- `get_project` — design tokens, theme
- `get_screen` — `htmlCode.downloadUrl`, `screenshot.downloadUrl`
- `list_screens` — enumerate screens

Downloads use `curl -L` on the hosted URLs returned by MCP.

## React routes

| Screen | Route |
|--------|--------|
| Intake & Onboarding | `/` |
| AI Scanning State | `/scanning` |
| Matched Opportunities | `/dashboard` |
| Application Helper | `/dashboard` + Apply panel |

Use the demo section on onboarding or bottom nav to jump between screens.
