<script lang="ts">
	import type { PostEmbedImage } from '..';

	const { data }: { data: PostEmbedImage } = $props();
</script>

{#snippet imageSnippet(
	image: {
		alt: string;
		thumb: string;
		fullsize: string;
		aspectRatio?: { width: number; height: number };
	},
	className?: string
)}
	<img
		loading="lazy"
		src={image.thumb}
		alt={image.alt}
		style={image.aspectRatio
			? `aspect-ratio: ${image.aspectRatio.width} / ${image.aspectRatio.height}`
			: 'aspect-ratio: 1 / 1'}
		class={[
			'border-base-500/20 dark:border-base-400/20 w-fit max-w-full rounded-2xl border max-h-[40rem] object-contain',
			className
		]}
	/>
{/snippet}

{#if data.images.length === 1}
	{@render imageSnippet(data.images[0])}
{:else}
	<div class="columns-2 gap-4">
		{#each data.images as image}
			{@render imageSnippet(image, 'mb-4')}
		{/each}
	</div>
{/if}
