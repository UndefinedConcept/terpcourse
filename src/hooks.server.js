/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	/* Preload CSS and fonts files */
	return await resolve(event, {
		preload: ({ type }) => type === 'css' || type === 'font'
	});
}