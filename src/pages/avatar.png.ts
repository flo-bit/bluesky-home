import { getCollection } from "astro:content";

const profile = await getCollection('profile');

export async function GET() {
	const response = await fetch(
		profile[0].data.avatar
	);
	const buffer = Buffer.from(await response.arrayBuffer());
  
	return new Response(buffer, {
	  headers: { "Content-Type": "image/png" },
	});
  }