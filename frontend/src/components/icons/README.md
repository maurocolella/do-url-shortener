# Icon Components

This directory contains reusable SVG icon components for the URL Shortener application.

## Available Icons

- `ArrowLeftIcon` - Used for navigation back buttons
- `ChartIcon` - Used for analytics and statistics
- `ClipboardIcon` - Used for copy-to-clipboard functionality
- `EyeIcon` - Used for view details actions
- `GoogleIcon` - Used for Google authentication
- `LightningIcon` - Used to represent speed and performance
- `LinkIcon` - Used to represent URLs and links
- `MenuIcon` - Used for mobile menu toggle (has an `isOpen` prop)
- `ShieldIcon` - Used to represent security and protection
- `TrashIcon` - Used for delete actions

## Usage

Import icons from the icons directory:

```tsx
import { ClipboardIcon, LinkIcon } from '../components/icons';
```

Use them in your components:

```tsx
<ClipboardIcon className="h-5 w-5" />
```

### Props

All icons accept the following props:

- `className`: Optional string for custom styling (default: 'h-5 w-5')

The `MenuIcon` component also accepts:

- `isOpen`: Optional boolean to toggle between hamburger and close icons (default: false)
