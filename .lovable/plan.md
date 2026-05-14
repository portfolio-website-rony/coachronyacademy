## Blog System — Admin Panel + Public Page

Goal: Admin theke banner image soho blog post lika, edit, delete kora jabe. Public `/blog` page real data theke load hobe, ar `/blog/$slug` te full post pora jabe.

### 1. Admin Panel — Blog Tab Upgrade (`src/routes/_admin/admin.cms.tsx`)

Existing Blog tab te edit functionality + banner uploader add korbo (Portfolio jevabe ache):

- **Edit state**: `blogEditId`, `blogEdit`, `blogCover` track korbe.
- **Cover banner**: existing text input bad diye `ImageUploader` use korbo (folder: `blog`).
- **Form fields**:
  - Title (required)
  - Slug (auto-generate from title, editable)
  - Excerpt (short summary)
  - Cover image — ImageUploader
  - Content — boro textarea (markdown supported, ~12 rows)
  - Tags (comma separated)
  - Published checkbox
- **Edit button** prottek row e — click korle form prefilled hobe.
- **Update vs Insert** logic — `pfEditId` patterner moto.
- **Cancel button** edit mode e.

### 2. Public Blog List Page (`src/routes/blog.tsx`)

Hardcoded `POSTS` array bad. Supabase theke fetch:
- `cms_blog_posts` where `published = true`, ordered by `published_at` / `created_at` desc
- `cms_page_banners` where `page = 'blog'` → optional hero banner above grid
- Each card: cover image, title, excerpt, tags, date, link to `/blog/$slug`
- Search input — client-side filter on title/excerpt
- Empty state if no posts

### 3. Single Post Page (NEW: `src/routes/blog.$slug.tsx`)

- Fetch post by slug from `cms_blog_posts`
- Render: cover banner, title, date, tags, then content (markdown rendered)
- Use `react-markdown` for content rendering — install via `bun add react-markdown`
- Back to blog link
- SEO meta tags from post data (title, excerpt, og:image = cover_url)
- 404 if not found / not published

### 4. No DB changes needed
`cms_blog_posts` table already has all required columns (title, slug, excerpt, content, cover_url, tags, published, published_at). Banner support already exists via `cms_page_banners` (admin can already set 'blog' banner from Page Banners tab).

### Out of scope
- Rich text WYSIWYG editor (markdown textarea diye start, later upgrade kora jabe)
- Comments / likes
- Categories beyond tags
- Related posts / recommendations

Shob admin theke control hobe — ekta dedicated "Write New Post" button thakbe Blog tab e, banner ekhane cover image hisebe attach hobe.
