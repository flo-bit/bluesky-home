
import { AtpBaseClient } from "@atproto/api";
import type { Loader } from "astro/loaders";

const didPDSCache: Record<string, string> = {};

const getPDS = async (did: string) => {
	if (did in didPDSCache) return didPDSCache[did];
	const res = await fetch(
		did.startsWith('did:web')
			? `https://${did.split(':')[2]}/.well-known/did.json`
			: 'https://plc.directory/' + did
	);

	return res.json().then((doc) => {
		if (!doc.service) throw new Error('No PDS found');
		for (const service of doc.service) {
			if (service.id === '#atproto_pds') {
				didPDSCache[did] = service.serviceEndpoint.toString();
			}
		}
		return didPDSCache[did];
	});
};


export async function getProfile({
	agent,
	did,
  }: {
	agent: AtpBaseClient;
	did: string;
  }) {
	const { data } = await agent.app.bsky.actor.getProfile({ actor: did });
	return data;
  }

export async function listRecords({ did, collection, cursor }: { did: string; collection: string, cursor?: string }): Promise<any> {
  const pds = await getPDS(did);

  const agent = new AtpBaseClient({ service: pds });

  const room = await agent.com.atproto.repo.listRecords({
    repo: did,
    collection,
    limit: 100,
    cursor,
  });

  return room.data.records;
}

export async function getRecord({ did, collection, rkey }: { did: string; collection: string, rkey: string }): Promise<any> {
	const pds = await getPDS(did);
  
	const agent = new AtpBaseClient({ service: pds });
  
	const room = await agent.com.atproto.repo.getRecord({
	  repo: did,
	  collection,
	  rkey
	});
  
	return room.data;
}

export async function resolveHandle({ handle }: { handle: string }) {
	const agent = new AtpBaseClient({ service: 'https://public.api.bsky.app' });

	const data = await agent.com.atproto.identity.resolveHandle({ handle });
	return data.data.did;
}

export const authorLinksLoader = ({
	identifier,
	limit,
  }: {
	identifier: string;
	limit?: number;
  }): Loader => {
	return {
	  name: "bluesky-links-loader",
	  async load({ store, logger, meta, parseData }) {
		try {
		  const mostRecent = meta.get("lastFetched") ?? 0;
  
		  let cursor = undefined;
		  let first;
		  let count = 0;
		  let did = await resolveHandle({ handle: identifier });

		  fetching: do {
			const data = await listRecords({
			  did,
			  collection: "link.flo-bit.dev",
			  cursor,
			});
  
			for (const post of data) {
			  if (
				(mostRecent && mostRecent === post.cid) ||
				(limit && count >= limit)
			  ) {
				count++;
				break fetching;
			  }
			  count++;
			
			  first ??= post.cid;
  
			  store.set({
				id: post.uri,
				data: await parseData({
				  id: post.uri,
				  // Convert the post object to a plain object
				  data: JSON.parse(JSON.stringify(post)),
				}),
			  });
			}
			cursor = data.cursor;
			logger.info(`Fetched ${count} links`);
		  } while (cursor);
  
		  if (first) {
			meta.set("lastFetched", first);
		  }
		} catch (error) {
		  logger.error(
			`Failed to load Bluesky links. ${(error as Error).message}`,
		  );
		}
	  },
	};
  };


export const authorSocialLinksLoader = ({
	identifier,
	limit,
  }: {
	identifier: string;
	limit?: number;
  }): Loader => {
	return {
	  name: "bluesky-social-links-loader",
	  async load({ store, logger, meta, parseData }) {
		try {
		  const mostRecent = meta.get("lastFetched") ?? 0;
  
		  let cursor = undefined;
		  let first;
		  let count = 0;
		  let did = await resolveHandle({ handle: identifier });

		  fetching: do {
			const data = await listRecords({
			  did,
			  collection: "dev.flo-bit.social",
			  cursor,
			});
  
			for (const post of data) {
			  if (
				(mostRecent && mostRecent === post.cid) ||
				(limit && count >= limit)
			  ) {
				count++;
				break fetching;
			  }
			  count++;
			
			  first ??= post.cid;
  
			  store.set({
				id: post.uri,
				data: await parseData({
				  id: post.uri,
				  // Convert the post object to a plain object
				  data: JSON.parse(JSON.stringify(post)),
				}),
			  });
			}
			cursor = data.cursor;
			logger.info(`Fetched ${count} links`);
		  } while (cursor);
  
		  if (first) {
			meta.set("lastFetched", first);
		  }
		} catch (error) {
		  logger.error(
			`Failed to load Bluesky links. ${(error as Error).message}`,
		  );
		}
	  },
	};
  };

  export const authorProfileLoader = ({
	identifier,
  }: {
	identifier: string;
  }): Loader => {
	return {
		name: "bluesky-profile-loader",
		async load({ store, logger, meta, parseData }) {
			try {
				const did = await resolveHandle({ handle: identifier });

				const agent = new AtpBaseClient({ service: 'https://public.api.bsky.app' });
				const profile = await getProfile({ agent, did });

				store.set({
					id: did,
					data: await parseData({
						id: did,
						data: JSON.parse(JSON.stringify(profile)),
					}),
				});
			} catch (error) {
				logger.error(`Failed to load Bluesky profile. ${(error as Error).message}`);
			}
		}
	}
}


import { marked } from 'marked';


export const authorAboutLoader = ({
	identifier,
	limit,
  }: {
	identifier: string;
	limit?: number;
  }): Loader => {
	return {
	  name: "bluesky-about-loader",
	  async load({ store, logger, meta, parseData }) {
		try {
  
		  let cursor = undefined;
		  let first;
		  let count = 0;
		  let did = await resolveHandle({ handle: identifier });

			const data = await getRecord({
			  did,
			  collection: "dev.flo-bit.about",
			  rkey: "self",
			});

			console.log('data');
			console.log(data);


			  const parsed = await parseData({
				id: data.uri,
				// Convert the post object to a plain object
				data: JSON.parse(JSON.stringify(data)),
			  });

			  console.log('parsed');
			  console.log(parsed);
  
			  store.set({
				id: data.uri,
				data: parsed,
				body: parsed.plaintext,
				rendered: {html: await marked.parse(data.value.content)},
			  });
			  
  
		} catch (error) {
		  logger.error(
			`Failed to load Bluesky links. ${(error as Error).message}`,
		  );
		}
	  },
	};
  };


export const authorBlogPostsLoader = ({
	identifier,
	limit,
  }: {
	identifier: string;
	limit?: number;
  }): Loader => {
	return {
	  name: "bluesky-blog-posts-loader",
	  async load({ store, logger, meta, parseData }) {
		try {
		  const mostRecent = meta.get("lastFetched") ?? 0;
  
		  let cursor = undefined;
		  let first;
		  let count = 0;
		  let did = await resolveHandle({ handle: identifier });

		  fetching: do {
			const data = await listRecords({
			  did,
			  collection: "com.whtwnd.blog.entry",
			  cursor,
			});
  
			for (const post of data) {
			  if (
				(mostRecent && mostRecent === post.cid) ||
				(limit && count >= limit)
			  ) {
				count++;
				break fetching;
			  }
			  count++;
			
			  first ??= post.cid;

			  console.log('post');
			  console.log(post);

			  const parsed = await parseData({
				id: post.uri,
				// Convert the post object to a plain object
				data: JSON.parse(JSON.stringify(post)),
			  });

			  console.log('parsed');
			  console.log(parsed);
  
			  store.set({
				id: post.uri,
				data: parsed,
				body: parsed.plaintext,
				rendered: {html: await marked.parse(post.value.content)},
			  });
			}
			cursor = data.cursor;
			logger.info(`Fetched ${count} blog posts`);
		  } while (cursor);
  
		  if (first) {
			meta.set("lastFetched", first);
		  }
		} catch (error) {
		  logger.error(
			`Failed to load Bluesky links. ${(error as Error).message}`,
		  );
		}
	  },
	};
  };
