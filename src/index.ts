/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


import index from "./index.html";
import { parse } from "cookie";
import jwt from '@tsndr/cloudflare-worker-jwt'
import { Buffer } from "node:buffer";

export interface Env {
	FORCE_DOWNLOAD: string;
	PASSWORD: string;
	ALLOWED_DOMAINS: string;
	SIGN_KEY: string
}

function checkDomain(allowDomains: string, domain: string) {
	allowDomains = allowDomains || ""
	if (allowDomains !== "") {
		return allowDomains.split(",").some(rule => {
			const regexString = '^' + rule.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
			return new RegExp(regexString).test(domain)
		})
	} else {
		return true
	}
}

async function checkAuth(req: Request, signKey: string, password: string) {
	const cookie = parse(req.headers.get("Cookie") || "");
	const authentication = cookie["Authentication"] || req.headers.get("authorization") || ""
	if (authentication !== "") {
		if (authentication.indexOf("Basic") === 0) {
			const encodedstr = authentication.substring(6)
			const decodedstr = Buffer.from(encodedstr, 'base64').toString('ascii');
			const userpass = decodedstr.split(":")
			return (userpass.length === 2 && userpass[1] === password)
		} else if (authentication.indexOf("Bearer") === 0) {
			let jwttoken = authentication.substring(7)
			return await jwt.verify(jwttoken, signKey)
		}
	}
	return false
}

async function proxyRequest(proxyurl: string, req: Request, forceDownload: boolean) {

	let host = (new URL(proxyurl)).host

	let header = new Headers(req.headers)
	header.set("Host", host)
	header.delete("accept-encoding")

	try {
		const proxyResp = await fetch(proxyurl, {
			method: "GET",
			headers: header,
			redirect: "manual"
		})

		let respHeaders = new Headers(proxyResp.headers)
		if (respHeaders.has("location")) {
			return proxyRequest(respHeaders.get("location") || "", req, forceDownload)
		}
		respHeaders.delete("content-security-policy");
		respHeaders.delete("content-security-policy-report-only");
		respHeaders.delete("clear-site-data");
		respHeaders.delete("content-encoding")
		respHeaders.set("access-control-expose-headers", "*");
		respHeaders.set("access-control-allow-origin", "*");

		if (!respHeaders.has("content-disposition")) {
			if (forceDownload) {
				respHeaders.set("content-disposition", "attachment");
			}
		}

		return new Response(proxyResp.body as any, {
			status: proxyResp.status,
			headers: respHeaders
		})
	} catch (e: any) {
		return new Response(e.message, { status: 500 });
	}


}


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url)
		const PASSWORD = (env.PASSWORD || "") + ""
		const SIGN_KEY = (env.SIGN_KEY || "abcdefg") + ""

		if (url.pathname.indexOf("/proxy/") === 0) {
			
			if (PASSWORD === "" || await checkAuth(request, SIGN_KEY, PASSWORD)) {
				const ALLOWED_DOMAINS = env.ALLOWED_DOMAINS || ""
				const proxyurl = request.url.substring(request.url.indexOf("/proxy/") + 7)

				if (checkDomain(ALLOWED_DOMAINS, new URL(proxyurl).host)) {
					const forceDownload = (env.FORCE_DOWNLOAD || "").toLocaleLowerCase() !== "false"
					const resp = proxyRequest(proxyurl, request, forceDownload)
					return resp;
				} else {
					return new Response("Domain is not allowed", { status: 400 })
				}


			} else {
				return new Response("Authorization failed", { status: 401 })
			}

		}

		if (url.pathname === "" || url.pathname === "/") {
			return new Response(index, {
				headers: {
					"content-type": "text/html",
				},
			});
		}

		if (url.pathname === "/auth/login") {
			const PASSWORD = (env.PASSWORD || "") + ""
			if (PASSWORD !== "") {
				const bodyjson: any = await request.json()
				const pwd: string = bodyjson["password"]
				if (pwd === PASSWORD) {
					const authentication = await jwt.sign({ exp: Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 30) }, SIGN_KEY)
					return Response.json({
						authentication: authentication
					})
				} else {
					return new Response("密码错误", { status: 401 })
				}
			} else {
				return Response.json({})
			}
		}

		if (url.pathname === "/auth/check") {
			const PASSWORD = (env.PASSWORD || "") + ""
			if (PASSWORD === "" || await checkAuth(request, SIGN_KEY, PASSWORD)) {
				return new Response("", { status: 200 })
			} else {
				return new Response("Authorization failed", { status: 401 })
			}
		}

		return new Response('Not Found', {
			status: 404
		});
	},
} satisfies ExportedHandler<Env>;
