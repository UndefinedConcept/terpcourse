<div class="top-12 bottom-0 px-4 py-2 lg:top-14 xl:top-16">
	<h1 class="border-b-2 border-border pb-1 text-2xl font-bold">Welcome to TerpCourse</h1>
	<p class="my-2">
		TerpCourse is a course search tool built for students at UMD that accepts compact multi‑query
		strings to help students narrow down their search to find the courses. Built to help students
		plan their schedules and make informed decisions about their course and section selections.
	</p>
	<!-- button to change theme -->
	<button
		class="rounded bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/80"
		on:click={() => {
			if (document.documentElement.classList.contains('dark')) {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			} else {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			}
		}}
	>
		Toggle Theme
	</button>
</div>
