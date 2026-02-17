<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';

	const Pages = [
		{ name: 'Home', href: '/', title: 'Home Page' },
		{ name: 'About', href: '/about', title: 'About Page' },
		{
			name: 'Github',
			href: 'https://github.com/UndefinedConcept/terpcourse',
			title: 'Github Repository'
		}
	];

	let isChecked = false;
</script>

<nav
	class="mx-auto flex items-center justify-between border-y-2 border-t-transparent border-b-border bg-background px-4 py-2 text-foreground"
>
	<a class="text-xl font-bold text-primary" href="/"> TerpCourse </a>

	<input type="checkbox" id="hamburger-menu" class="peer hidden" bind:checked={isChecked} />
	<label
		for="hamburger-menu"
		class="static top-3 right-4 z-10 h-6 w-6 cursor-pointer peer-checked:hidden md:hidden hover:text-primary"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
			><path
				fill="currentColor"
				d="M4 18q-.425 0-.712-.288T3 17t.288-.712T4 16h16q.425 0 .713.288T21 17t-.288.713T20 18zm0-5q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm0-5q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"
			/>
		</svg>
	</label>
	<label
		for="hamburger-menu"
		class="static top-3 right-4 z-10 hidden h-6 w-6 cursor-pointer max-md:peer-checked:block md:hidden hover:text-primary"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
			><path
				fill="currentColor"
				d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
			/></svg
		>
	</label>
	<label
		for="hamburger-menu"
		class="fixed inset-0 top-12 hidden h-full w-full bg-sidebar opacity-0 transition-opacity duration-700 max-md:peer-checked:block max-md:peer-checked:opacity-50 md:hidden"
	>
	</label>
	<div
		class="no-scrollbar overflow-y-scroll transition-transform duration-300 max-md:fixed max-md:top-0 max-md:-right-64 max-md:bottom-0 max-md:w-64 max-md:flex-col max-md:gap-6 max-md:border-l-2 max-md:border-border max-md:bg-background max-md:peer-checked:-translate-x-64"
	>
		<ul
			class="flex items-center gap-8 font-semibold max-md:relative max-md:top-10 max-md:flex-col max-md:gap-8 max-md:text-xl max-md:font-bold"
		>
			{#each Pages as { name, href, title }}
				<a {href} onclick={() => (isChecked = false)} {title} class="block w-full text-center transition-colors duration-300 hover:text-primary">
					<li
						class="inline border-b-2 border-transparent [&.active]:border-primary/60"
						class:active={page.url.pathname == href}
					>
						{name}
					</li>
				</a>
			{/each}
			<ThemeToggle />
		</ul>
	</div>
</nav>
