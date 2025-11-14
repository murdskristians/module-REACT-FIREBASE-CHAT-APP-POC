# ChrisClaude Project Documentation

## Project Overview
This is a React + Firebase chat application proof-of-concept (react-firechat-poc).

## Tech Stack
- **React**: 19.2.0
- **Firebase**: 12.5.0
- **TypeScript**: For type safety
- **pnpm**: Package manager
- **React Router**: For routing
- **Testing**: Jest and React Testing Library

## Project Structure
```
react-firechat-poc/
├── .claude/          # Claude configuration
├── build/            # Build output
├── docs/             # Documentation
├── firebase/         # Firebase configuration
├── public/           # Public assets
├── scripts/          # Build and utility scripts
├── src/              # Source code
│   └── pages/
│       └── auth/     # Authentication pages
└── tests/            # Test files
```

## Current Branch
- **Working Branch**: chris-4
- **Status**: Active development

## Recent Work
Based on recent commits:
- General setup for chat functionality
- Authentication implementation
- Production redirect fixes

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm run dev
```

### Build for Production
```bash
pnpm run build
```

## Piche.ui Design System

### Overview
This project uses **piche.ui**, a custom component library that wraps Material UI components. All components have the same names as Material UI but with a "Pui" prefix.

**Example:** `PuiTypography` is actually the `Typography` component from Material UI and supports the same properties.

### Usage Example
```tsx
import { PuiTooltip, PuiTypography, useTheme } from 'piche.ui';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <PuiTypography
      variant="body-lg-semibold"
      sx={{ color: theme.palette.primary.main }}
    >
      Hello World
    </PuiTypography>
  );
};
```

### PuiTypography Variants

#### Headings
| Variant | Font Size | Weight | Line Height | Letter Spacing |
|---------|-----------|--------|-------------|----------------|
| `h1` | 48px | 600 | 1.2 | -0.5px |
| `h2` | 40px | 600 | 1.2 | normal |
| `h3` | 32px | 600 | 1.32 | normal |
| `h4` | 24px | 600 | 1.3 | normal |
| `h5` | 20px | 600 | 1.4 | normal |
| `h6` | 18px | 600 | 1.4 | normal |

#### Body Text - Bold (700)
| Variant | Font Size | Line Height | Letter Spacing |
|---------|-----------|-------------|----------------|
| `body-xl-bold` | 18px | 1.5 | normal |
| `body-lg-bold` | 16px | 1.5 | 0.3px |
| `body-m-bold` | 14px | 1.6 | 0.2px |
| `body-sm-bold` | 12px | 1.6 | 0.2px |
| `body-xs-bold` | 10px | 1.6 | 0.2px |

#### Body Text - Semibold (600)
| Variant | Font Size | Line Height | Letter Spacing |
|---------|-----------|-------------|----------------|
| `body-xl-semibold` | 18px | 1.5 | normal |
| `body-lg-semibold` | 16px | 1.5 | 0.3px |
| `body-m-semibold` | 14px | 1.6 | normal |
| `body-sm-semibold` | 12px | 1.6 | normal |
| `body-xs-semibold` | 10px | 1.6 | normal |

#### Body Text - Medium (500)
| Variant | Font Size | Line Height | Letter Spacing |
|---------|-----------|-------------|----------------|
| `body-xl-medium` | 18px | 1.5 | normal |
| `body-lg-medium` | 16px | 1.5 | 0.2px |
| `body-m-medium` | 14px | 1.6 | normal |
| `body-sm-medium` | 12px | 1.6 | normal |
| `body-xs-medium` | 10px | 1.6 | normal |

#### Body Text - Regular (400)
| Variant | Font Size | Line Height | Letter Spacing |
|---------|-----------|-------------|----------------|
| `body-xl-regular` | 18px | 1.5 | normal |
| `body-lg-regular` | 16px | 1.5 | 0.2px |
| `body-m-regular` | 14px | 1.6 | normal |
| `body-sm-regular` | 12px | 1.6 | normal |
| `body-xs-regular` | 10px | 1.6 | normal |

#### Standard Material UI Variants
| Variant | Font Size | Weight | Line Height | Letter Spacing |
|---------|-----------|--------|-------------|----------------|
| `body1` | 18px | 400 | 1.5 | normal |
| `body2` | 16px | 400 | 1.5 | 0.2px |
| `subtitle1` | 14px | 400 | 1.6 | normal |
| `subtitle2` | 12px | 400 | 1.6 | normal |

**Font Family:** All variants use `'Poppins', 'Inter', sans-serif`

### Theme Color Palette

#### Primary Colors (Blue)
```tsx
theme.palette.primary.main        // #3398DB (base)
theme.palette.primary.dark        // #4AA3DF (500)
theme.palette.primary.light       // #E8F4FB
theme.palette.primary.softLight   // #F5FBFF
theme.palette.primary.extraLight  // #FAFDFF
theme.palette.primary[25]         // #D2E8F7
theme.palette.primary[50]         // #BBDDF3
```

#### Status Colors

**Success (Green)**
```tsx
theme.palette.success.main   // #67D286
theme.palette.success.light  // #9AE1AE (100)
theme.palette.success.dark   // #80DA9A (200)
```

**Warning (Orange)**
```tsx
theme.palette.warning.main   // #FBB13C
theme.palette.warning.light  // #FCCB7D (100)
theme.palette.warning.dark   // #FCBE5C (200)
```

**Error (Red)**
```tsx
theme.palette.error.main   // #E16D6D
theme.palette.error.light  // #EB9D9D (100)
theme.palette.error.dark   // #E68585 (200)
```

#### Grey Scale
```tsx
theme.palette.grey[50]   // #EFEFEF
theme.palette.grey[100]  // #DBDBDB
theme.palette.grey[200]  // #B7B7B7
theme.palette.grey[300]  // #939393
theme.palette.grey[400]  // #6F6F6F
theme.palette.grey[500]  // #4B4B4B
theme.palette.grey[550]  // #323232
theme.palette.grey[600]  // #272727 (base)
```

#### Background & Common
```tsx
theme.palette.background.default  // #FAFAFA (light)
theme.palette.background.paper    // #FFFFFF
theme.palette.common.white        // #FFFFFF
theme.palette.divider             // #EFEFEF (grey[50])
```

### Using Theme in Styles
```tsx
import { useTheme } from 'piche.ui';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <div style={{
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.light,
      borderColor: theme.palette.divider
    }}>
      Content
    </div>
  );
};
```

## Notes
- Claude Code has been initialized in this project
- Environment variables are configured in `.env`
- Using pnpm with hoisted node linker for dependency management

## Additional

- Dont put any comments in code
- End files with empty line
- Put new line before return statements