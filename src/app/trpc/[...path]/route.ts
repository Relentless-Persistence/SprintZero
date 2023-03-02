import {fetchRequestHandler} from "@trpc/server/adapters/fetch"

import {appRouter} from "~/server/routers/_app"

export const GET = async (request: Request): Promise<Response> =>
	await fetchRequestHandler({
		req: request,
		endpoint: `/trpc`,
		router: appRouter,
		createContext: () => ({}),
		onError: (err) => {
			console.error(err)
		},
	})

export const POST = async (request: Request): Promise<Response> =>
	await fetchRequestHandler({
		req: request,
		endpoint: `/trpc`,
		router: appRouter,
		createContext: () => ({}),
		onError: (err) => {
			console.error(err)
		},
	})
