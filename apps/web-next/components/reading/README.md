# Single Component - Universal Content Reader

The `Single.tsx` component is a universal content reader that handles both **dynamics** (educational activities) and **posts** (blog articles) with enhanced reading features from the `@repo/edu-editor` package.

## Features

### Core Functionality
- **Universal Content Support**: Handles both dynamics and posts with type-specific headers
- **HTML Content Rendering**: Uses `TiptapRenderer` to properly render stored HTML content
- **Reading Progress Bar**: Visual progress indicator that tracks reading progress
- **Table of Contents**: Automatic TOC generation with smooth scroll navigation
- **Mobile-Responsive**: Floating TOC toggle for mobile devices
- **SEO Optimized**: Proper metadata generation for both content types

### Reading Enhancements
- **Progress Tracking**: Reading progress bar at the top of the page
- **TOC Navigation**: Desktop sidebar and mobile overlay TOC
- **Smooth Scrolling**: Navigate directly to sections via TOC
- **User-Specific Theming**: Reading progress color adapts to user preferences

### Content-Specific Headers

#### Dynamic Headers
- Dynamic type and difficulty tags
- Duration, student count, age group, and difficulty level
- Materials needed section
- Objective and description
- Author information with publication date

#### Post Headers
- Featured status badge
- Cover image display
- Post summary
- Author information with publication and update dates

## File Structure

```
components/reading/
├── Single.tsx                    # Main universal component
├── PostTocNext.tsx              # Next.js compatible TOC component
├── PostReadingProgressNext.tsx  # Next.js compatible reading progress
└── README.md                    # This documentation
```

## Usage

### Basic Implementation

```typescript
import Single from '@/components/reading/Single';

// For a dynamic/activity page
<Single 
  contentType="dynamic"
  slug="interactive-grammar-game"
  locale="en"
/>

// For a blog post page
<Single 
  contentType="post"
  slug="teaching-strategies-2024"
  locale="es"
/>
```

### Page Implementation Examples

#### Dynamic Page (`/[locale]/activities/[slug]/page.tsx`)

```typescript
import Single from '@/components/reading/Single';
import { getDynamicBySlug } from '@/lib/data';

export default async function DynamicPage({ params }) {
  const { locale, slug } = params;
  
  const dynamic = await getDynamicBySlug(slug);
  if (!dynamic) notFound();

  return (
    <main>
      <Single 
        contentType="dynamic"
        slug={slug}
        locale={locale}
      />
    </main>
  );
}
```

#### Blog Post Page (`/[locale]/blog/[slug]/page.tsx`)

```typescript
import Single from '@/components/reading/Single';
import { getPostBySlug } from '@/lib/data';

export default async function BlogPostPage({ params }) {
  const { locale, slug } = params;
  
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main>
      <Single 
        contentType="post"
        slug={slug}
        locale={locale}
      />
    </main>
  );
}
```

## Component Props

### Single Component Props

```typescript
interface SingleProps {
  contentType: 'dynamic' | 'post';  // Type of content to display
  slug: string;                     // Content slug for fetching
  locale: string;                   // Locale for translations and formatting
}
```

### PostTocNext Props

```typescript
interface PostTocNextProps {
  containerSelector?: string;       // CSS selector for content container
  headingSelector?: string;         // CSS selector for headings (default: 'h2, h3, h4')
}
```

### PostReadingProgressNext Props

```typescript
interface PostReadingProgressNextProps {
  color?: ColorType;               // Progress bar color
  containerSelector?: string;      // CSS selector for content container
}
```

## Internationalization

The component supports multiple locales and includes translations for:

- Content type labels (Activity/Article)
- UI elements (Edit buttons, navigation)
- Error messages and loading states
- Date formatting
- Dynamic metadata (duration, difficulty, etc.)

### Supported Locales
- `en` - English
- `es` - Spanish

## Mobile Responsiveness

### Desktop Experience
- Sidebar TOC with sticky positioning
- Full-width reading progress bar
- Side-by-side layout (content + TOC)

### Mobile Experience
- Floating TOC toggle button (bottom-right)
- Full-screen TOC overlay when activated
- Simplified progress bar (thinner)
- Single-column layout

## Content Types

### Dynamics (Educational Activities)

Dynamic content includes:
- **Type**: Reading, Conversation, Teaching Strategy, Grammar, etc.
- **Difficulty**: Beginner, Intermediate, Advanced
- **Duration**: Time in minutes
- **Student Count**: Min/max participants
- **Age Group**: Kids, Teens, Adults, All Ages
- **Materials**: Required materials list
- **Objective**: Learning goals
- **Content**: Rich HTML content with instructions

### Posts (Blog Articles)

Post content includes:
- **Featured Status**: Highlighted articles
- **Cover Image**: Hero image display
- **Summary**: Article excerpt
- **Content**: Rich HTML article content
- **Tags**: Categorization (if implemented)
- **Publication/Update Dates**: Temporal context

## Authentication & Permissions

### Edit Access
Users can edit content if:
- User role is `ADMIN`
- User is the content author (`user.email === content.authorEmail`)

### Visibility
- Published content is visible to all users
- Unpublished content is only visible to authors and admins
- Draft badge appears for unpublished content when user has edit access

## SEO & Metadata

Both page implementations include comprehensive metadata:

### Dynamic Pages
- Title format: `{title} - Educational Activity`
- Keywords: activity type, difficulty, education terms
- Open Graph article metadata
- Structured data for educational content

### Blog Post Pages
- Title format: `{title} - Educational Blog`
- Cover image in Open Graph
- Article publication/modification times
- Author attribution

## Performance Considerations

### Loading States
- Skeleton loaders for both content types
- Graceful error handling with fallback UI
- Server-side rendering support

### Optimizations
- Lazy loading for images
- Intersection Observer for TOC and progress tracking
- Debounced scroll events
- Efficient re-renders with proper dependency arrays

## Dependencies

### Required Packages
- `@repo/edu-editor` - Core reading components and TiptapRenderer
- `@repo/api-bridge` - Type definitions and API interfaces
- `next/navigation` - Next.js routing
- `next/image` - Optimized image component

### Required API Endpoints
- `getDynamicBySlug(slug)` - Fetch dynamic by slug
- `getPostBySlug(slug)` - Fetch post by slug
- User authentication context

## Customization

### Theme Colors
The reading progress bar automatically adapts to user preferences:
- Lavender: `#A47BB9`
- Coral: `#E08D79`
- Teal: `#5C9EAD`
- Warm Pink: `#D46BA3`
- Blue: `#779ECB`
- Purple: `#8859A3`

### CSS Variables
The component uses CSS variables for theming:
- `--primary` - Primary brand color
- `--gray-*` - Grayscale palette
- `--primary-*` - Primary color variations

## Future Enhancements

Potential improvements for the Single component:

1. **Social Sharing**: Add share buttons for social media
2. **Print Optimization**: CSS print styles for content
3. **Reading Time Estimation**: Calculate and display estimated reading time
4. **Content Rating**: User rating system for content
5. **Related Content**: Suggestions based on content type/tags
6. **Comments System**: User comments and discussions
7. **Bookmarking**: Save content for later reading
8. **Accessibility**: Enhanced screen reader support and keyboard navigation

## Troubleshooting

### Common Issues

1. **TOC Not Appearing**
   - Ensure content has proper heading structure (h2, h3, h4)
   - Check that `.article-content` container exists
   - Verify headings have or can generate unique IDs

2. **Progress Bar Not Working**
   - Confirm `.article-content` selector matches your content container
   - Check for JavaScript errors in browser console
   - Ensure content height is sufficient for progress calculation

3. **Content Not Loading**
   - Verify API endpoints are correctly configured
   - Check network requests in browser dev tools
   - Ensure proper error handling in data fetching functions

4. **Edit Button Not Showing**
   - Confirm user authentication is working
   - Check user permissions (admin or author)
   - Verify content has proper `authorEmail` field