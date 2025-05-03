import { defineCollection } from "astro:content";
import { authorFeedLoader } from "@ascorbic/bluesky-loader";
import { authorBlogPostsLoader, authorLinksLoader, authorProfileLoader, authorSocialLinksLoader, authorAboutLoader } from "./utils/atproto";

import { HANDLE } from "astro:env/client";

console.log(HANDLE);

const posts = defineCollection({
  loader: authorFeedLoader({
    identifier: HANDLE,
    filter: 'posts_no_replies',
  }),
});

const links = defineCollection({
  loader: authorLinksLoader({
    identifier: HANDLE,
  }),
});

const socialLinks = defineCollection({
  loader: authorSocialLinksLoader({
    identifier: HANDLE,
  }),
});

const profile = defineCollection({
  loader: authorProfileLoader({
    identifier: HANDLE,
  }),
});

const blog = defineCollection({
  loader: authorBlogPostsLoader({
    identifier: HANDLE,
  }),
});

const about = defineCollection({
  loader: authorAboutLoader({
    identifier: HANDLE,
  }),
});

export const collections = { blog, posts, links, socialLinks, profile, about };