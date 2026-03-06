<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	let { class: className = '', children, ...anchorProps }: HTMLAnchorAttributes = $props();
</script>

<a {...anchorProps} class={`group flex items-center gap-1 ${className}`.trim()}>
	{@render children?.()}
	<span
		class="h-4 w-4 -translate-x-0.5 transition-transform duration-250 group-hover:translate-x-0 group-hover:-translate-y-0.5"
		aria-hidden="true"
	>
		<svg
			class="h-full w-full"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
		>
			<path d="M6.343 17.657L17.657 6.343m0 0v8.485m0-8.485H9.172" />
		</svg>
	</span>
</a>
