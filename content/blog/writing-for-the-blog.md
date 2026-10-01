---
title: Writing for the HyScale blog
description: How to publish a post on the lab website, with examples of everything a Markdown post can contain.
date: 2026-10-01
tags: [lab-news]
authors: [jooyoung-park]
draft: true
---

This is a reference post for lab members. It is marked `draft: true`, so it is built but not listed on the blog or in the RSS feed. Delete it, or flip `draft` to `false` once the first real post is ready.

## Publishing a post

1. Create `content/blog/<slug>.md`. The file name becomes the URL: `/blog/<slug>/`.
2. Fill in the front matter at the top:

```yaml
---
title: Our paper at OSDI
description: One sentence shown on the blog list and in link previews.
date: 2026-10-01
tags: [serverless, cold-starts] # ids from content/tags.yaml
authors: [jooyoung-park] # ids from content/people.yaml
draft: false
---
```

3. Push to `main`. The site rebuilds and publishes itself. Unknown tags or authors stop the build with a message naming the file.

## What Markdown can do

Text can be **bold**, _italic_, `inline code` and [links](https://vhive-serverless.github.io/). Lists, tables and quotes work as usual:

| System  | Venue  | Year |
| ------- | ------ | ---- |
| REAP    | ASPLOS | 2021 |
| Jukebox | ISCA   | 2022 |

> Quotes are good for highlighting a key result.

### Code

```go
func handler(ctx context.Context, req Request) (Response, error) {
	return Response{Body: "hello from a cold start"}, nil
}
```

### Math

Inline math like $p_{99} = \mu + 2.33\,\sigma$ and display math are rendered at build time:

$$
\text{cost} = \sum_{i=1}^{n} t_i \cdot m_i \cdot \lambda
$$

### Images

Put images next to the post (for example `content/blog/<slug>/figure.png`) and reference them with a relative path: `![Alt text](./<slug>/figure.png)`.
