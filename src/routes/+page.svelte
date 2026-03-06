<script>
	import Search from '$lib/components/search/Search.svelte';
	import Results from '$lib/components/search/Results.svelte';
</script>

<main class="flex flex-col gap-1 px-4 md:grid md:grid-cols-[22rem_1fr]">
	<section id="schedule" class="order-1 min-h-80 py-2 max-md:h-[60lvh] md:order-2 md:h-[calc(100lvh-3rem)]">
		<div class="flex h-full items-center justify-center rounded-lg bg-secondary">
			<p class="text-6xl font-bold">Schedule</p>
		</div>
	</section>
	<section
		class="order-2 scrollbar min-h-80 overflow-y-scroll pr-1 max-md:h-[90lvh] md:order-1 md:h-[calc(100lvh-3rem)]"
	>
		<Search />
		<Results />
	</section>
</main>
