# [TerpCourse](https://terpcourse.vercel.app/)

TerpCourse is a course search tool built for students at UMD that accepts compact multi‑query strings to help students narrow down their search to find the courses. built to help students plan their schedules and make informed decisions about their course and section selections.


## File Structure

```
terpcourse/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components and UI elements
│   │   ├── utils/          # Utility functions and helpers
│   │   └── types/          # TypeScript type definitions
│   ├── routes/             # SvelteKit pages and API routes
│   ├── app.html            # HTML template
│   ├── app.css             # Global styles
│   └── theme.css           # Theme configuration and color tokens
├── static/                 # Static assets (images, fonts, etc.)
├── package.json            # Dependencies and scripts
├── svelte.config.js        # SvelteKit configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.js          # Vite build configuration
```


## Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** — Required runtime for the dev server and build tools
- **[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)** —  Package manager for installing dependencies (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at [`http://localhost:5173`](http://localhost:5173)


## Theme colors usage

Color system defined in `src/theme.css` that automatically adapts between light and dark modes. All colors are mapped to CSS variables and exposed as Tailwind utility classes. *Never use hardcoded colors outside of `theme.css`. Always only use Tailwind custom colors.*

**Available Custom Colors:**

| Color Type    | Description                                   | Tailwind Usage                                  |
| ------------- | --------------------------------------------- | ----------------------------------------------- |
| `background`  | Main page background and primary text color   | `bg-background`, `text-foreground`              |
| `card`        | Card/panel backgrounds and their text         | `bg-card`, `text-card-foreground`               |
| `popover`     | Popover/dropdown backgrounds and text         | `bg-popover`, `text-popover-foreground`         |
| `primary`     | Primary action color and its contrasting text | `bg-primary`, `text-primary-foreground`         |
| `secondary`   | Secondary action color and text               | `bg-secondary`, `text-secondary-foreground`     |
| `muted`       | Muted/disabled states and subtle text         | `bg-muted`, `text-muted-foreground`             |
| `accent`      | Accent highlights and their text              | `bg-accent`, `text-accent-foreground`           |
| `destructive` | Destructive actions (delete, error) and text  | `bg-destructive`, `text-destructive-foreground` |
| `border`      | Border color for dividers and outlines        | `border-border`                                 |
| `input`       | Input field borders                           | `border-input`                                  |
| `ring`        | Focus ring color for accessibility            | `ring-ring`                                     |


## Sources

- [**shadcn-svelte**](https://shadcn-svelte.com/themes) — main color palette located in `/src/theme.css`
- [**Inter**](https://rsms.me/inter/) — main UI font located in `/static/fonts`
