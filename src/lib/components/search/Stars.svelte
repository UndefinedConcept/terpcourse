<script lang="ts">
	export let rating: number = 0;
	
	$: fillPercentage =	rating*20;
	$: gradient = `linear-gradient(90deg, var(--primary) 0%, var(--primary) ${fillPercentage}%, var(--muted) ${fillPercentage}%, var(--muted) 100%)`;
</script>

<span class="inline bg-clip-text text-transparent" title="{rating} out of 5" style={`background-image: ${gradient};`}>
	★★★★★
</span>
