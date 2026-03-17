import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { tasksRouter } from "./endpoints/tasks/router";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummyEndpoint";
import { CertStatus } from "./endpoints/status"; // Imported sensing logic

// Define the environment bindings for D1
type Env = {
	DB: D1Database;
};

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
	if (err instanceof ApiException) {
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err);

	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
	schema: {
		info: {
			title: "CertSense API",
			version: "1.0.0",
			description: "System for External Network Sensing & Event Intelligence (SENSEI)",
		},
	},
});

/**
 * Endpoint Registration
 * Using openapi.get ensures the routes are recognized by the template's internal mapping
 */

// 1. Register the CertSense Status Dashboard
openapi.get("/status", CertStatus);

// 2. Register existing template routes
openapi.route("/tasks", tasksRouter);
openapi.post("/dummy/:slug", DummyEndpoint);

// Export the Hono app for Cloudflare Workers
export default app;
export default app;
