import departments from '$lib/data/dept.json';
import gen_eds from '$lib/data/gened.json';
import type { FilterOperator, FilterType, ParsedSearchTokens, SearchToken } from '../../types';

type NumberRange = { min: number; max: number };
type TokenGroupKind = 'code' | 'gened';

type FilterDefinition = {
	key: string;
	type: FilterType;
	description: string;
	valueHints?: string[];
	numberRange?: NumberRange;
};

export type ParsedFilter = SearchToken;

export type FilterSuggestion = {
	label: string;
	description: string;
	insertText: string;
	cursorOffset?: number;
};

export type SuggestionApplyResult = {
	value: string;
	cursor: number;
};

export type InvalidSearchToken = {
	token: string;
	reason: string;
	pattern?: string;
};

export const TOKEN_PATTERNS = {
	partialFilter: '^@([a-zA-Z][\\w-]*)(<=|>=|=|<|>)?(.*)$',
	stringFilter: '^@([a-zA-Z][\\w-]*)="[^"]*"$',
	numberFilter: '^@([a-zA-Z][\\w-]*)(<=|>=|=|<|>)(-?\\d+(?:\\.\\d+)?)$',
	booleanFilter: '^@([a-zA-Z][\\w-]*)(=(true|false))?$',
	codeToken: '^[a-zA-Z]{4}((\\d{0,3})|(?:\\d{3}[a-zA-Z]{0,2}))?$',
	genedToken: '^[a-zA-Z]{4}$',
	bracketGroup: '^\\[[^\\]]*\\]$'
} as const;

const PARTIAL_FILTER_PATTERN = new RegExp(TOKEN_PATTERNS.partialFilter);
const STRING_FILTER_PATTERN = new RegExp(TOKEN_PATTERNS.stringFilter);
const NUMBER_FILTER_PATTERN = new RegExp(TOKEN_PATTERNS.numberFilter);
const BOOLEAN_FILTER_PATTERN = new RegExp(TOKEN_PATTERNS.booleanFilter, 'i');
const CODE_TOKEN_PATTERN = new RegExp(TOKEN_PATTERNS.codeToken, 'i');
const GENED_TOKEN_PATTERN = new RegExp(TOKEN_PATTERNS.genedToken, 'i');
const BRACKET_GROUP_PATTERN = new RegExp(TOKEN_PATTERNS.bracketGroup);
const OPERATORS: FilterOperator[] = ['=', '<', '>', '<=', '>='];

const deptCodes = departments.map((department) => department.dept_code.toUpperCase());
const genedCodes = gen_eds.map((gened) => gened.gened_code.toUpperCase());
const deptNameByCode = new Map(
	departments.map((department) => [department.dept_code.toUpperCase(), department.name])
);
const genedNameByCode = new Map(
	gen_eds.map((gened) => [gened.gened_code.toUpperCase(), gened.name])
);
const deptCodeSet = new Set(deptCodes);
const genedCodeSet = new Set(genedCodes);

const FILTERS: FilterDefinition[] = [
	{ key: 'title', type: 'string', description: 'Course title text' },
	{ key: 'desc', type: 'string', description: 'Description contains text' },
	{
		key: 'credits',
		type: 'number',
		description: 'Credits as a number',
		valueHints: ['1', '3', '4'],
		numberRange: { min: 1, max: 5 }
	},
	{
		key: 'level',
		type: 'number',
		description: 'Course level',
		valueHints: ['1', '2', '3', '4', '10'],
		numberRange: { min: 1, max: 10 }
	},
	{ key: 'open', type: 'boolean', description: 'Only open sections', valueHints: ['true', 'false'] }
];

function getFilterFromKey(key: string): FilterDefinition | undefined {
	return FILTERS.find((item) => item.key === key.toLowerCase());
}

function getActiveTokenRange(input: string): { start: number; end: number; token: string } {
	let inQuotes = false;
	let bracketDepth = 0;
	let start = 0;

	for (let index = 0; index < input.length; index += 1) {
		const char = input[index];
		if (char === '"') {
			inQuotes = !inQuotes;
			continue;
		}
		if (!inQuotes) {
			if (char === '[') bracketDepth += 1;
			if (char === ']' && bracketDepth > 0) bracketDepth -= 1;
			if (char === ' ' && bracketDepth === 0) start = index + 1;
		}
	}

	return { start, end: input.length, token: input.slice(start) };
}

function parseStringSuggestionPrefix(raw: string) {
	const trimmed = raw.trimStart();
	const hasOpeningQuote = trimmed.startsWith('"');
	const prefix = hasOpeningQuote ? trimmed.slice(1) : trimmed;
	return { prefix, hasOpeningQuote };
}

function mapHints(
	key: string,
	operator: FilterOperator | '=',
	hints: string[],
	description: string,
	max: number
) {
	return hints.slice(0, max).map((hint) => {
		const insertText = `@${key}${operator}${hint}`;
		return { label: insertText, description, insertText, cursorOffset: insertText.length };
	});
}

function dedupeFilterTokens(tokens: string[]): string[] {
	const deduped: string[] = [];
	const seen = new Set<string>();
	for (let index = tokens.length - 1; index >= 0; index -= 1) {
		const token = tokens[index];
		const parsed = parseFilterToken(token);
		if (parsed) {
			if (seen.has(parsed.key)) continue;
			seen.add(parsed.key);
		}
		deduped.push(token);
	}
	return deduped.reverse();
}

function getUsedFilterKeys(input: string, currentToken: string): Set<string> {
	return new Set(
		tokenizeInput(input)
			.filter((token) => token !== currentToken)
			.map(parseFilterToken)
			.filter((parsed): parsed is ParsedFilter => parsed !== null)
			.map((parsed) => parsed.key)
	);
}

function isInRange(value: number, range?: NumberRange): boolean {
	if (!range) return true;
	return value >= range.min && value <= range.max;
}

function isCodeToken(token: string): boolean {
	const normalized = token.toUpperCase();
	if (!CODE_TOKEN_PATTERN.test(normalized)) return false;
	if (normalized.length === 4) return deptCodeSet.has(normalized);
	return deptCodeSet.has(normalized.slice(0, 4));
}

function isGenedToken(token: string): boolean {
	const normalized = token.toUpperCase();
	return GENED_TOKEN_PATTERN.test(normalized) && genedCodeSet.has(normalized);
}

function getCodeSuggestionDescription(code: string): string {
	const genedName = genedNameByCode.get(code);
	if (genedName) return `[gened] ${genedName}`;

	const deptName = deptNameByCode.get(code);
	if (deptName) return `[dept] ${deptName}`;

	return `code:${code}`;
}

function parseBracketItems(content: string): string[] {
	return content
		.split(/[\s,]+/)
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => item.toUpperCase());
}

function classifyToken(token: string): TokenGroupKind | null {
	if (isGenedToken(token)) return 'gened';
	if (isCodeToken(token)) return 'code';
	return null;
}

function validateBracketGroup(token: string): InvalidSearchToken | null {
	if (!BRACKET_GROUP_PATTERN.test(token)) {
		return {
			token,
			reason: 'Bracket token must be fully closed, like [CMSC131 MATH141].',
			pattern: TOKEN_PATTERNS.bracketGroup
		};
	}

	const content = token.slice(1, -1);
	const items = parseBracketItems(content);
	if (items.length === 0) {
		return { token, reason: 'Bracket token cannot be empty.' };
	}

	let groupKind: TokenGroupKind | null = null;
	for (const item of items) {
		const kind = classifyToken(item);
		if (!kind) {
			return {
				token,
				reason: `Invalid item '${item}' inside []. Use only valid course/dept codes or gened codes.`,
				pattern: `${TOKEN_PATTERNS.codeToken} | ${TOKEN_PATTERNS.genedToken}`
			};
		}
		if (!groupKind) groupKind = kind;
		if (groupKind !== kind) {
			return {
				token,
				reason: 'Items inside [] must be all code tokens or all gened tokens (no mixing).'
			};
		}
	}

	return null;
}

function getBracketGroupKind(token: string): TokenGroupKind | null {
	if (!token.startsWith('[') || !token.endsWith(']')) return null;
	const items = parseBracketItems(token.slice(1, -1));
	if (items.length === 0) return null;

	let groupKind: TokenGroupKind | null = null;
	for (const item of items) {
		const kind = classifyToken(item);
		if (!kind) return null;
		if (!groupKind) groupKind = kind;
		if (groupKind !== kind) return null;
	}

	return groupKind;
}

function validateNonFilterToken(token: string): InvalidSearchToken | null {
	if (token.startsWith('[') || token.endsWith(']')) return validateBracketGroup(token);
	if (isCodeToken(token) || isGenedToken(token)) return null;
	return {
		token,
		reason: 'Token must be a valid code/gened token, a bracket group, or a valid @filter.',
		pattern: `${TOKEN_PATTERNS.codeToken} | ${TOKEN_PATTERNS.genedToken}`
	};
}

function parseByDefinition(token: string, definition: FilterDefinition): ParsedFilter | null {
	if (definition.type === 'string') {
		const match = token.match(STRING_FILTER_PATTERN);
		if (!match || match[1].toLowerCase() !== definition.key) return null;
		const raw = token.slice(token.indexOf('=') + 1);
		return { key: definition.key, type: 'string', operator: '=', value: raw.slice(1, -1) };
	}

	if (definition.type === 'boolean') {
		const match = token.match(BOOLEAN_FILTER_PATTERN);
		if (!match || match[1].toLowerCase() !== definition.key) return null;
		const explicitValue = match[3]?.toLowerCase();
		return {
			key: definition.key,
			type: 'boolean',
			operator: '=',
			value: explicitValue ? explicitValue === 'true' : true
		};
	}

	const match = token.match(NUMBER_FILTER_PATTERN);
	if (!match || match[1].toLowerCase() !== definition.key) return null;
	const value = Number(match[3]);
	if (!Number.isFinite(value) || !isInRange(value, definition.numberRange)) return null;
	return {
		key: definition.key,
		type: 'number',
		operator: match[2] as FilterOperator,
		value
	};
}

function getInvalidFilterReason(token: string, definition?: FilterDefinition): InvalidSearchToken {
	if (!definition) {
		return { token, reason: 'Unknown filter key.', pattern: TOKEN_PATTERNS.partialFilter };
	}

	if (definition.type === 'string') {
		return {
			token,
			reason: `Invalid string filter for @${definition.key}. Use @${definition.key}="text".`,
			pattern: TOKEN_PATTERNS.stringFilter
		};
	}

	if (definition.type === 'boolean') {
		return {
			token,
			reason: `Invalid boolean filter for @${definition.key}. Use @${definition.key}, @${definition.key}=true, or @${definition.key}=false.`,
			pattern: TOKEN_PATTERNS.booleanFilter
		};
	}

	return {
		token,
		reason: definition.numberRange
			? `Invalid number filter for @${definition.key}. Value must be in range ${definition.numberRange.min}-${definition.numberRange.max}.`
			: `Invalid number filter for @${definition.key}.`,
		pattern: TOKEN_PATTERNS.numberFilter
	};
}

function parseNonFilterTokens(tokens: string[]): {
	code: string[];
	genedAnd: string[];
	genedOr: string[];
} {
	const code = new Set<string>();
	const genedAnd = new Set<string>();
	const genedOr = new Set<string>();

	for (const token of tokens) {
		if (token.startsWith('@')) continue;

		if (token.startsWith('[') && token.endsWith(']')) {
			const kind = getBracketGroupKind(token);
			for (const item of parseBracketItems(token.slice(1, -1))) {
				if (kind === 'gened' && isGenedToken(item)) genedOr.add(item);
				else if (kind === 'code' && isCodeToken(item)) code.add(item);
			}
			continue;
		}

		const normalized = token.toUpperCase();
		if (isGenedToken(normalized)) genedAnd.add(normalized);
		else if (isCodeToken(normalized)) code.add(normalized);
	}

	return {
		code: [...code],
		genedAnd: [...genedAnd],
		genedOr: [...genedOr]
	};
}

function getBracketSuggestionContext(token: string): {
	currentFragment: string;
	kind: TokenGroupKind | null;
} | null {
	if (!token.startsWith('[') || token.includes(']')) return null;
	const inside = token.slice(1);
	const parts = parseBracketItems(inside);
	const rawParts = inside.split(/[\s,]+/);
	const currentFragment = (rawParts.at(-1) ?? '').toUpperCase();

	let kind: TokenGroupKind | null = null;
	for (const part of parts.slice(0, Math.max(parts.length - 1, 0))) {
		const classified = classifyToken(part);
		if (classified) {
			kind = classified;
			break;
		}
	}

	return { currentFragment, kind };
}

function getUsedOrKinds(input: string, currentToken: string): Set<TokenGroupKind> {
	const kinds = new Set<TokenGroupKind>();
	for (const token of tokenizeInput(input)) {
		if (token === currentToken) continue;
		const kind = getBracketGroupKind(token);
		if (kind) kinds.add(kind);
	}
	return kinds;
}

export function tokenizeInput(input: string): string[] {
	const tokens: string[] = [];
	let current = '';
	let inQuotes = false;
	let bracketDepth = 0;

	for (const char of input.trim()) {
		if (char === '"') {
			inQuotes = !inQuotes;
			current += char;
			continue;
		}

		if (!inQuotes) {
			if (char === '[') bracketDepth += 1;
			if (char === ']' && bracketDepth > 0) bracketDepth -= 1;
		}

		if (char === ' ' && !inQuotes && bracketDepth === 0) {
			if (current) tokens.push(current);
			current = '';
			continue;
		}

		current += char;
	}

	if (current) tokens.push(current);
	return tokens;
}

export function getActiveToken(input: string): string {
	return getActiveTokenRange(input).token;
}

export function parseFilterToken(token: string): ParsedFilter | null {
	if (!token.startsWith('@')) return null;
	const key = token.match(/^@([a-zA-Z][\w-]*)/)?.[1]?.toLowerCase();
	const definition = key ? getFilterFromKey(key) : undefined;
	if (!definition) return null;
	return parseByDefinition(token, definition);
}

export function getInvalidToken(token: string): InvalidSearchToken | null {
	if (!token) return null;
	if (!token.startsWith('@')) return validateNonFilterToken(token);

	if (!PARTIAL_FILTER_PATTERN.test(token)) {
		return {
			token,
			reason: 'Filter token has invalid structure.',
			pattern: TOKEN_PATTERNS.partialFilter
		};
	}

	const key = token.match(/^@([a-zA-Z][\w-]*)/)?.[1]?.toLowerCase();
	const definition = key ? getFilterFromKey(key) : undefined;
	if (definition && parseByDefinition(token, definition)) return null;
	return getInvalidFilterReason(token, definition);
}

export function getFilterSuggestions(input: string, maxSuggestions = 6): FilterSuggestion[] {
	const token = getActiveToken(input);

	if (!token.startsWith('@')) {
		const bracketContext = getBracketSuggestionContext(token);
		if (bracketContext) {
			const usedKinds = getUsedOrKinds(input, token);
			const allowedKinds: TokenGroupKind[] = bracketContext.kind
				? [bracketContext.kind]
				: (['code', 'gened'] as TokenGroupKind[]).filter((kind) => !usedKinds.has(kind));

			const list = allowedKinds.flatMap((kind) => (kind === 'gened' ? genedCodes : deptCodes));
			const expectedPattern =
				allowedKinds.length === 1
					? allowedKinds[0] === 'gened'
						? TOKEN_PATTERNS.genedToken
						: TOKEN_PATTERNS.codeToken
					: `${TOKEN_PATTERNS.codeToken} | ${TOKEN_PATTERNS.genedToken}`;

			return list
				.filter((code) => code.startsWith(bracketContext.currentFragment))
				.slice(0, maxSuggestions)
				.map((code) => {
					const insertText = `${token}${code.slice(bracketContext.currentFragment.length)} `;
					return {
						label: code,
						description: `${getCodeSuggestionDescription(code)} (OR in [] regex: ${expectedPattern})`,
						insertText,
						cursorOffset: insertText.length
					};
				});
		}

		const plainPrefix = token.toUpperCase();
		return [...deptCodes, ...genedCodes]
			.filter((code) => code.startsWith(plainPrefix))
			.slice(0, maxSuggestions)
			.map((code) => ({
				label: code,
				description: getCodeSuggestionDescription(code),
				insertText: code,
				cursorOffset: code.length
			}));
	}

	const usedKeys = getUsedFilterKeys(input, token);
	const keyPrefixMatch = token.match(/^@([a-zA-Z][\w-]*)?$/);
	if (keyPrefixMatch) {
		const keyPrefix = (keyPrefixMatch[1] ?? '').toLowerCase();
		return FILTERS.filter((item) => item.key.startsWith(keyPrefix) && !usedKeys.has(item.key))
			.slice(0, maxSuggestions)
			.map((item) => {
				const insertText =
					item.type === 'string'
						? `@${item.key}=""`
						: item.type === 'boolean'
							? `@${item.key}`
							: `@${item.key}=`;
				return {
					label: `@${item.key}`,
					description: `${item.description} (${item.type})`,
					insertText,
					cursorOffset: item.type === 'string' ? `@${item.key}="`.length : insertText.length
				};
			});
	}

	const partialMatch = token.match(PARTIAL_FILTER_PATTERN);
	if (!partialMatch) return [];

	const key = partialMatch[1].toLowerCase();
	const operator = (partialMatch[2] || '=') as FilterOperator;
	const valuePrefix = partialMatch[3].toLowerCase();
	const filter = getFilterFromKey(key);
	if (!filter) return [];

	if (filter.type === 'boolean') {
		if (operator !== '=') return [];
		const suggestions: FilterSuggestion[] = [];
		if (!valuePrefix || 'true'.startsWith(valuePrefix)) {
			suggestions.push({
				label: `@${key}`,
				description: 'boolean flag (defaults to true)',
				insertText: `@${key}`,
				cursorOffset: `@${key}`.length
			});
		}
		if (!valuePrefix || 'false'.startsWith(valuePrefix)) {
			suggestions.push({
				label: `@${key}=false`,
				description: 'boolean value',
				insertText: `@${key}=false`,
				cursorOffset: `@${key}=false`.length
			});
		}
		return suggestions.slice(0, maxSuggestions);
	}

	if (filter.type === 'string') {
		if (operator !== '=') return [];
		const { prefix, hasOpeningQuote } = parseStringSuggestionPrefix(partialMatch[3]);
		const typedPrefix = hasOpeningQuote ? `"${prefix.toLowerCase()}` : prefix.toLowerCase();
		return mapHints(
			key,
			'=',
			['example', 'intro to programming']
				.map((hint) => `"${hint}"`)
				.filter((hint) => hint.toLowerCase().startsWith(typedPrefix)),
			'quoted string value',
			maxSuggestions
		);
	}

	if (!partialMatch[2]) {
		if (usedKeys.has(key)) return [];
		return OPERATORS.slice(0, maxSuggestions).map((nextOperator) => {
			const insertText = `@${key}${nextOperator}`;
			return {
				label: insertText,
				description: 'number operator',
				insertText,
				cursorOffset: insertText.length
			};
		});
	}

	return mapHints(
		key,
		operator,
		(filter.valueHints ?? []).filter((hint) => hint.startsWith(valuePrefix)),
		'number value',
		maxSuggestions
	);
}

export function applySuggestion(
	input: string,
	suggestion: FilterSuggestion
): SuggestionApplyResult {
	const { start, end } = getActiveTokenRange(input);
	const before = input.slice(0, start);
	const after = input.slice(end);
	const raw = `${before}${suggestion.insertText}${after.length === 0 ? ' ' : after}`;
	const value = enforceUniqueFilters(raw);
	const cursor = Math.min(
		start + (suggestion.cursorOffset ?? suggestion.insertText.length),
		value.length
	);
	return { value, cursor };
}

export function enforceUniqueFilters(input: string): string {
	return dedupeFilterTokens(tokenizeInput(input)).join(' ');
}

export function parseSearchInput(input: string): {
	tokens: string[];
	validTokens: string[];
	filters: ParsedFilter[];
	duplicateFilterKeys: string[];
	invalidTokens: InvalidSearchToken[];
	searchTokens: ParsedSearchTokens;
} {
	const tokens = tokenizeInput(input);
	const invalidTokens = tokens
		.map(getInvalidToken)
		.filter((item): item is InvalidSearchToken => item !== null);
	let validTokens = tokens.filter((token) => !getInvalidToken(token));

	const codeSingles = validTokens.filter(
		(token) => !token.startsWith('[') && !token.startsWith('@') && isCodeToken(token)
	);
	const codeOrGroups = validTokens.filter((token) => getBracketGroupKind(token) === 'code');

	if (codeOrGroups.length > 0 && codeSingles.length > 0) {
		for (const token of codeOrGroups) {
			invalidTokens.push({
				token,
				reason:
					'A single course code is already present. Remove [] OR-list, or keep only one [] OR-list with no single code token.'
			});
		}
	}

	if (codeOrGroups.length === 0 && codeSingles.length > 1) {
		for (const token of codeSingles.slice(1)) {
			invalidTokens.push({
				token,
				reason: `Multiple course codes found. Combine as one OR-list, e.g. [${codeSingles
					.map((code) => code.toUpperCase())
					.join(' ')}].`
			});
		}
	}

	const grouped = validTokens
		.filter((token) => token.startsWith('[') && token.endsWith(']'))
		.map((token) => ({ token, kind: getBracketGroupKind(token) }))
		.filter((entry): entry is { token: string; kind: TokenGroupKind } => entry.kind !== null);

	const kindCounts = grouped.reduce(
		(map, entry) => map.set(entry.kind, (map.get(entry.kind) ?? 0) + 1),
		new Map<TokenGroupKind, number>()
	);

	for (const kind of ['code', 'gened'] as TokenGroupKind[]) {
		if ((kindCounts.get(kind) ?? 0) <= 1) continue;
		let seenOne = false;
		for (const entry of grouped) {
			if (entry.kind !== kind) continue;
			if (!seenOne) {
				seenOne = true;
				continue;
			}
			invalidTokens.push({
				token: entry.token,
				reason: `Only one ${kind.toUpperCase()} OR-list [] is allowed in the query.`
			});
		}
	}

	if (invalidTokens.length > 0) {
		const invalidSet = new Set(invalidTokens.map((item) => item.token));
		validTokens = validTokens.filter((token) => !invalidSet.has(token));
	}

	const filters = validTokens
		.map(parseFilterToken)
		.filter((parsed): parsed is ParsedFilter => parsed !== null);

	const counts = filters.reduce((map, filter) => {
		map.set(filter.key, (map.get(filter.key) ?? 0) + 1);
		return map;
	}, new Map<string, number>());

	const duplicateFilterKeys = [...counts.entries()]
		.filter(([, count]) => count > 1)
		.map(([key]) => key);

	const { code, genedAnd, genedOr } = parseNonFilterTokens(validTokens);
	const searchTokens: ParsedSearchTokens = {
		code,
		genedAnd,
		genedOr,
		gened: genedAnd,
		filter: filters
	};
	return { tokens, validTokens, filters, duplicateFilterKeys, invalidTokens, searchTokens };
}
