import { defineCollection } from "astro:content";
import { authorFeedLoader } from "@ascorbic/bluesky-loader";
import { authorBlogPostsLoader, authorLinksLoader, authorProfileLoader, authorSocialLinksLoader, authorAboutLoader } from "./utils/atproto";

const posts = defineCollection({
  loader: authorFeedLoader({
    identifier: 'flo-bit.dev',
    filter: 'posts_no_replies',
  }),
});

const links = defineCollection({
  loader: authorLinksLoader({
    identifier: 'flo-bit.dev',
  }),
});

const socialLinks = defineCollection({
  loader: authorSocialLinksLoader({
    identifier: 'flo-bit.dev',
  }),
});

const profile = defineCollection({
  loader: authorProfileLoader({
    identifier: 'flo-bit.dev',
  }),
});

const blog = defineCollection({
  loader: authorBlogPostsLoader({
    identifier: 'flo-bit.dev',
  }),
});

const about = defineCollection({
  loader: authorAboutLoader({
    identifier: 'flo-bit.dev',
  }),
});

export const collections = { blog, posts, links, socialLinks, profile, about };