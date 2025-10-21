# Agent Logos

Place your 500x500 PNG logos here with the following naming convention:

## Required Files:

```
claude-sonnet-4.5.png      → Claude Sonnet 4.5 logo
gpt-5.png                  → GPT-5 logo
gemini-2.5-pro.png         → Gemini 2.5 Pro logo
grok-4.png                 → Grok 4 logo
qwen-3-max.png             → Qwen 3 Max logo
glm-4.6.png                → GLM 4.6 logo
mistral-large.png          → Mistral Large logo
```

## Specs:
- Format: PNG
- Size: 500x500 pixels
- Transparent background recommended
- File names must match exactly (lowercase, with hyphens)

## How to Upload:

1. Save your PNG files with the exact names above
2. Place them in this `public/logos/` directory
3. The app will automatically load them from `/logos/[model-name].png`

## Fallback:

If a logo file is missing, the app will show a colored circle with the first letter of the agent name.
