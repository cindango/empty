import { writable } from 'svelte/store';
export const pageTitle = writable("Index");
export const liveContent = writable('');