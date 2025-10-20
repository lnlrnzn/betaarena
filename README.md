# Beta Arena

A Next.js project with custom design tokens using OKLCH color space and Tailwind CSS.

## Features

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS with custom design tokens
- OKLCH color space for better color consistency
- Custom shadow system
- Geist Mono font family
- Component-ready structure

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design System

The project uses custom CSS variables defined in `app/globals.css`:

### Colors (OKLCH)

- **Primary**: Purple theme color
- **Secondary**: White
- **Accent**: Light purple accent
- **Destructive**: Orange-red for errors
- **Muted**: Subtle background variations
- **Border/Input/Ring**: Purple-based interactive elements

### Shadows

Custom shadow system with consistent purple tint:
- `shadow-2xs` to `shadow-2xl`

### Typography

- Font: Geist Mono (sans-serif fallback)
- Border radius: 0rem (sharp corners for modern look)

## Project Structure

```
betaarena/
├── app/
│   ├── globals.css       # Global styles and design tokens
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   └── utils.ts          # Utility functions (cn helper)
└── public/               # Static assets
```

## Tailwind Configuration

All design tokens are mapped to Tailwind utilities in `tailwind.config.ts`. Use them like:

```tsx
<div className="bg-primary text-primary-foreground shadow-md">
  Content
</div>
```

## Utility Functions

### cn() Helper

Located in `lib/utils.ts`, the `cn()` function combines `clsx` and `tailwind-merge` for conditional className handling:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

## Next Steps

1. Run `npm install` to install all dependencies
2. Start building your components in `components/ui/`
3. Customize design tokens in `app/globals.css` as needed
4. Add your pages in the `app/` directory
