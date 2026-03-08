import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";

export class CertStatus extends OpenAPIRoute {
  schema = {
    tags: ["Sensing"],
    summary: "Get Certificate Monitoring Status",
    responses: {
      "200": {
        description: "Returns a list of monitored certificates",
        content: {
          "application/json": {
            schema: z.object({
              project: z.string(),
              timestamp: z.string(),
              monitored_domains: z.array(z.any()),
            }),
          },
        },
      },
    },
  };

  async handle(c: any) {
    // This correctly pulls from your certsense-db binding
    const { results } = await c.env.DB.prepare(
      "SELECT hostname, issuer, expiry_date, status, last_check_at FROM monitored_certs ORDER BY expiry_date ASC"
    ).all();

    return {
      project: "CertSense",
      timestamp: new Date().toISOString(),
      monitored_domains: results,
    };
  }
}
