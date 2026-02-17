<label class="flex cursor-pointer justify-center hover:text-primary max-md:pb-10 w-full" title="Switch Theme">
	<input
		type="checkbox"
		id="theme-toggle"
		class="appearance-none"
		on:click={() => {
			if (document.documentElement.classList.contains('dark')) {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			} else {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			}
		}}
	/>
	<!-- sun for light theme -->
	<svg
		class="block h-[1.5em] w-[1.5em] dark:hidden"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
	>
		<path
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-width="2"
			d="M12 4.5V3m0 18v-1.5m9-7.5h-1.5m-15 0H3m14.303-5.303l1.061-1.061M5.636 18.364l1.06-1.06m11.668 1.06l-1.06-1.06M6.696 6.696l-1.06-1.06M16 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0z"
		/>
	</svg>

	<!-- moon for dark theme -->
	<svg
		class="hidden h-[1.5em] w-[1.5em] dark:block"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
	>
		<path
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9"
		/>
		<path
			class="animate-pulse"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M18 4v4 m2 -2h-4"
		/>
	</svg>
	<span class="ml-2 md:hidden">Theme</span>
</label>
