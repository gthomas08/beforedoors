import { AgentMail } from "./components/agentmail/client/index.js";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { env, httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const agentmail = new AgentMail(components.agentmail, {
      webhookSecret: env.AGENTMAIL_WEBHOOK_SECRET,
    });

    // The AgentMail client was built against an older Convex context signature;
    // the runtime contexts are compatible with the current generated context.
    return agentmail.handleWebhook(
      ctx as unknown as Parameters<AgentMail["handleWebhook"]>[0],
      request,
    );
  }),
});

export default http;
