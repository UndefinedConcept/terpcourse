<script lang="ts">
	import { tick } from 'svelte';
	import {
		applySuggestion,
		enforceUniqueFilters,
		getActiveToken,
		getFilterSuggestions,
		parseFilterToken,
		parseSearchInput,
		type FilterSuggestion
	} from '$lib/utils/search';

	let searchInput = '';
	let searchInputEl: HTMLInputElement | null = null;
	let selectedSuggestionIndex = -1;
	let submitError = '';

	$: suggestions = getFilterSuggestions(searchInput);
	$: currentToken = getActiveToken(searchInput);
	$: parsedFilter = parseFilterToken(currentToken);
	$: parsedInput = parseSearchInput(searchInput);
	$: duplicateFilterKeys = parsedInput.duplicateFilterKeys;
	$: invalidTokens = parsedInput.invalidTokens;
	$: if (selectedSuggestionIndex >= suggestions.length) selectedSuggestionIndex = -1;

	async function setCursor(position: number) {
		await tick();
		searchInputEl?.focus();
		searchInputEl?.setSelectionRange(position, position);
	}

	function closeDanglingDelimiters(value: string): {
		value: string;
		addedQuote: boolean;
		addedBrackets: number;
	} {
		let inQuotes = false;
		let bracketDepth = 0;

		for (const char of value) {
			if (char === '"') {
				inQuotes = !inQuotes;
				continue;
			}
			if (!inQuotes) {
				if (char === '[') bracketDepth += 1;
				if (char === ']' && bracketDepth > 0) bracketDepth -= 1;
			}
		}

		const closedValue = `${value}${inQuotes ? '"' : ''}${']'.repeat(bracketDepth)}`;
		return { value: closedValue, addedQuote: inQuotes, addedBrackets: bracketDepth };
	}

	async function insertAutoPair(open: string, close: string) {
		if (!searchInputEl) return;
		const start = searchInputEl.selectionStart ?? searchInput.length;
		const end = searchInputEl.selectionEnd ?? searchInput.length;
		const selectedText = searchInput.slice(start, end);

		searchInput = `${searchInput.slice(0, start)}${open}${selectedText}${close}${searchInput.slice(end)}`;
		const cursor = selectedText.length > 0 ? end + 2 : start + 1;
		await setCursor(cursor);
	}

	function applySelectedSuggestion(suggestion: FilterSuggestion) {
		const applied = applySuggestion(searchInput, suggestion);
		const autoClosed = closeDanglingDelimiters(applied.value);
		searchInput = autoClosed.value;
		selectedSuggestionIndex = -1;
		submitError = '';
		void setCursor(applied.cursor + (autoClosed.addedQuote ? 1 : 0) + autoClosed.addedBrackets);
	}

	function moveSelection(step: number) {
		if (suggestions.length === 0) return;
		if (selectedSuggestionIndex === -1) {
			selectedSuggestionIndex = step > 0 ? 0 : suggestions.length - 1;
			return;
		}
		selectedSuggestionIndex =
			(selectedSuggestionIndex + step + suggestions.length) % suggestions.length;
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === '"') {
			event.preventDefault();
			void insertAutoPair('"', '"');
			return;
		}

		if (event.key === '[') {
			event.preventDefault();
			void insertAutoPair('[', ']');
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveSelection(1);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveSelection(-1);
			return;
		}

		if (event.key === 'Tab' && suggestions.length > 0) {
			event.preventDefault();
			moveSelection(event.shiftKey ? -1 : 1);
			return;
		}

		if (event.key === 'Enter' && selectedSuggestionIndex >= 0 && suggestions.length > 0) {
			event.preventDefault();
			applySelectedSuggestion(suggestions[selectedSuggestionIndex]);
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		searchInput = closeDanglingDelimiters(searchInput).value;
		searchInput = enforceUniqueFilters(searchInput);
		const parsed = parseSearchInput(searchInput);

		if (parsed.invalidTokens.length > 0) {
			submitError = 'Invalid search tokens found. Fix the red warnings before submitting.';
			return;
		}

		if (parsed.duplicateFilterKeys.length > 0) {
			submitError = `Duplicate filters are not allowed: ${parsed.duplicateFilterKeys.join(', ')}`;
			return;
		}

		submitError = '';
		console.log('Search tokens:', parsed.searchTokens);
	}

	function handleSuggestionClick(suggestion: FilterSuggestion) {
		applySelectedSuggestion(suggestion);
	}
</script>

<div
	class="relative"
>
	<div class="h-12"></div>
	<div class="absolute top-2 z-10 rounded-lg border-2 border-border bg-sidebar focus-within:bg-secondary hover:bg-secondary w-full">
		<form onsubmit={handleSubmit} class="peer flex w-full flex-row-reverse py-2">
			<input
				id="search"
				type="text"
				class="grow bg-transparent pr-2 focus:outline-none {invalidTokens.length > 0
					? 'underline decoration-destructive decoration-wavy'
					: ''}"
				placeholder="Search by code, gen-edu, or filter (@)"
				onkeydown={handleInputKeydown}
				autocomplete="off"
				bind:value={searchInput}
				bind:this={searchInputEl}
			/>
			<button
				type="submit"
				class="mx-2 inline-block text-foreground focus:outline-none"
				title="Search"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24"
					><path
						fill="currentColor"
						d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
					/></svg
				>
			</button>
		</form>
		<div
			class="hidden w-full overflow-auto bg-sidebar text-card-foreground peer-focus-within:block peer-hover:block hover:block focus:block"
		>
			{#if searchInput !== '' && (suggestions.length > 0 || invalidTokens.length > 0)}
				{#each suggestions as suggestion, index}
					<button
						type="button"
						class="block w-full px-2 py-1 text-left hover:bg-muted focus:bg-muted focus:outline-none {selectedSuggestionIndex ===
						index
							? 'bg-muted'
							: ''}"
						onmouseenter={() => (selectedSuggestionIndex = index)}
						onclick={() => handleSuggestionClick(suggestion)}
					>
						<div class="font-medium">{suggestion.label}</div>
						<div class="text-xs text-muted-foreground">{suggestion.description}</div>
					</button>
				{/each}

				{#if invalidTokens.length > 0}
					<div
						class="border-t border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive"
					>
						<p class="font-medium">Invalid search tokens</p>
						<ul class="mt-1 space-y-1">
							{#each invalidTokens as invalid}
								<li>
									<span class="underline decoration-wavy">{invalid.token}</span>: {invalid.reason}
									{#if invalid.pattern}
										<div class="text-[11px] text-destructive">Pattern: {invalid.pattern}</div>
									{/if}
								</li>
							{/each}
						</ul>
						{#if duplicateFilterKeys.length > 0}
							<p class="px-1 pt-1 text-xs text-muted-foreground">
								Duplicate filters found: {duplicateFilterKeys.join(', ')}
							</p>
						{/if}

						{#if submitError}
							<p class="px-1 pt-1 text-xs text-destructive">{submitError}</p>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
