<script>
	import { normalizeCourses, formatTimeFromNumber } from '$lib/utils/courses';

    import testData from '$lib/data/test.json';
	let courses = normalizeCourses(testData);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<p>Here are some courses:</p>
<div class="courses-container">
	{#each courses as course (course.course_code)}
		<article class="course">
			<header>
				<h2>{course.name}</h2>
				<span class="course-code">{course.course_code}</span>
			</header>
			<details>
				<summary>Show more details</summary>
				<p>{course.description}</p>
			</details>
			<section class="sections">
				<h3>Sections</h3>
				<ul>
					{#each course.sections as section (section.sec_code)}
						<li class="section">
							<strong>{section.sec_code}</strong>
							<time>
                                {#each section.meetings as meeting}
                                    <div>
                                        {meeting.days.join('')}: {formatTimeFromNumber(meeting.start_time)} - {formatTimeFromNumber(meeting.end_time)} at 
                                        {#if meeting.location.building !== 'ONLINE'}
                                        <a href="https://maps.terpmail.umd.edu/?building={meeting.location.building}">{meeting.location.building} {meeting.location.room}</a>
                                        {:else}
                                        <span>ONLINE</span>
                                        {/if}
                                    </div>
                                {/each}
                            </time>
						</li>
					{/each}
				</ul>
			</section>
		</article>
	{/each}
</div>

<style>
	.courses-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.course {
		border: 1px solid #ccc;
		padding: 1rem;
		border-radius: 0.5rem;
	}
	.course-code {
		font-size: 0.875rem;
		color: #666;
	}
	.sections {
		margin-top: 1rem;
	}
</style>
