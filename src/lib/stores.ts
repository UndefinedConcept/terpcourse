import { writable } from 'svelte/store';
import type { Course } from '../types';

export type ClientFilter = (courses: Course[]) => Course[];

export const baseResults = writable<Course[]>([]);
export const clientFilters = writable<Map<string, ClientFilter>>(new Map());

export const processed_results = writable<Course[]>([]);