const securityHeaders = [
	{
		key: `X-DNS-Prefetch-Control`,
		value: `on`,
	},
	{
		key: `Strict-Transport-Security`,
		value: `max-age=63072000; includeSubDomains; preload`,
	},
	{
		key: `X-XSS-Protection`,
		value: `1; mode=block`,
	},
	{
		key: `X-Content-Type-Options`,
		value: `nosniff`,
	},
	{
		key: `X-Frame-Options`,
		value: `sameorigin`,
	},
	{
		key: `Referrer-Policy`,
		value: `same-origin`,
	},
	{
		key: `Permissions-Policy`,
		value: `geolocation=*`, // allow specified policies here
	},
]

const config = {
	async headers() {
		return [
			{
				// Apply these headers to all routes in your application.
				source: `/:path*`,
				headers: securityHeaders,
			},
		]
	},
	experimental: {
		appDir: true,
	},
	compiler: {
		styledComponents: true,
	},
}

export default config
