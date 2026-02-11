<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>TerpCourse</title>
</svelte:head>
{@render children()}
