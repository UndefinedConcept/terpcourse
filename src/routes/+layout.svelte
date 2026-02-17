<script lang="ts">
	import '../app.css';

	import NavBar from '../lib/components/layout/NavBar.svelte';
</script>

<svelte:head>
	<title>TerpCourse</title>
</svelte:head>

<NavBar />

<slot />
