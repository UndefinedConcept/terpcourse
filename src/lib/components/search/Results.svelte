<script lang="ts">
	import data from '$lib/data/test.json';
	import { normalizeCourses, formatTimeFromNumber } from '$lib/utils/courses';

	const courses = normalizeCourses(data);
	const mapviewBaseUrl =
		'https://maps.umd.edu/map/index.html?defaultpopups=false&Nav=hide&hidemenu=true&MapView=Simple&LocationType=Building&LocationName=';
	const courseBaseUrl =
		'https://app.testudo.umd.edu/soc/search?sectionId=&_openSectionsOnly=on&creditCompare=%3E%3D&credits=0.0&courseLevelFilter=ALL&instructor=&_facetoface=on&_blended=on&_online=on&courseStartCompare=&courseStartHour=&courseStartMin=&courseStartAM=&courseEndHour=&courseEndMin=&courseEndAM=&teachingCenter=ALL&_classDay1=on&_classDay2=on&_classDay3=on&_classDay4=on&_classDay5=on&courseId=';
	const courseEndUrl = '&termId=202608'; // TODO: make this dynamic based on current term
	const planetTerpBaseUrl = 'https://planetterp.com/search?query=';
</script>

<div>
	{#each courses as course}
		<article class="my-2 rounded-md border-2 border-border text-card-foreground">
			<div class="sticky top-0 border-y-2 border-border bg-sidebar p-2">
				<header class="flex items-baseline justify-between">
					<span class="font-bold">{course.course_code}</span>
					<span>
						Credits:
						{#if course.min_credits == -1}
							N/A
						{:else if course.max_credits == null}
							{course.min_credits}
						{:else}
							{course.min_credits} - {course.max_credits}
						{/if}
					</span>
				</header>
				<a
					class="text-primary hover:underline"
					href="{courseBaseUrl}{course.course_code}{courseEndUrl}"
					title="View Course on Testudo"
					target="_blank"
					rel="noopener noreferrer"
				>
					<h3>{course.name}</h3>
				</a>
				<details>
					<summary class="hover:cursor-pointer">Show more details</summary>
					<p>
						{#each course.conditions as condition}
							<span class="mb-1 block text-foreground/70">
								<strong>{condition[0]}</strong><br />
								{condition[1]}
							</span>
						{/each}
						{course.description}
					</p>
				</details>
			</div>
			<!-- Sections: TODO -->
			<ul>
				{#each course.sections as section (section.sec_code)}
					<li
						class="flex flex-row gap-2 border-t-2 border-border p-2 hover:cursor-pointer hover:bg-sidebar"
					>
						<strong>{section.sec_code}</strong>
						<div class="grow">
							<a
								class="mb-1 text-primary hover:underline"
								href="{planetTerpBaseUrl}{section.instructors}"
								title="View Instructor on Planet Terp"
								target="_blank"
								rel="noopener noreferrer"
							>
								{section.instructors}
							</a>
							<time class="w-full">
								{#each section.meetings as meeting}
									<div class="flex items-baseline justify-between">
										<div>
											{meeting.days.join('')}
											{formatTimeFromNumber(meeting.start_time)} -
											{formatTimeFromNumber(meeting.end_time)}
										</div>
										<div>
											{#if meeting.location.building !== 'ONLINE'}
												<a
													class="text-primary hover:underline"
													href="{mapviewBaseUrl}{meeting.location.building}"
													title="View Location on UMD Maps"
													target="_blank"
													rel="noopener noreferrer"
												>
													{meeting.location.building}
													{meeting.location.room}
												</a>
											{:else}
												ONLINE
											{/if}
										</div>
									</div>
								{/each}
							</time>
						</div>
					</li>
				{/each}
			</ul>
		</article>
	{/each}
</div>
