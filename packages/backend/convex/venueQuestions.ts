import { AgentMail, type OutboundId } from "./components/agentmail/client/index.js";
import { components } from "./_generated/api";
import { env } from "./_generated/server";
import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";
import { authMutation, authQuery } from "./lib/customFunctions";

const MAX_QUESTIONS = 10;

const agentmail = new AgentMail(components.agentmail);

//#region Authenticated functions

export const sendVenueQuestions = authMutation({
  args: {
    requestKey: z.string().uuid(),
    venueName: z.string().trim().min(1).max(200),
    venueUrl: z.string().trim().max(2048),
    questions: z
      .array(z.string().trim().min(8, "Give the venue a little more detail.").max(300))
      .min(1, "Add at least one question.")
      .max(MAX_QUESTIONS, `Add no more than ${MAX_QUESTIONS} questions.`),
  },
  returns: z.object({
    requestId: zid("venueQuestionRequests"),
    outboundId: z.string(),
  }),
  handler: async (ctx, args) => {
    const existingRequest = await ctx.db
      .query("venueQuestionRequests")
      .withIndex("by_user_and_request_key", (q) =>
        q.eq("userId", ctx.userId).eq("requestKey", args.requestKey),
      )
      .unique();

    if (existingRequest) {
      return { requestId: existingRequest._id, outboundId: existingRequest.outboundId };
    }

    const fromEmail = env.BEFOREDOORS_EMAIL;
    const toEmail = env.TEST_VENUE_EMAIL;
    if (!fromEmail || !toEmail) {
      throw new Error(
        "AgentMail is not configured: set BEFOREDOORS_EMAIL and TEST_VENUE_EMAIL on the Convex deployment",
      );
    }

    const subject = `A question from BeforeDoors · ${args.venueName}`;
    const text = buildVenueQuestionEmail(args.venueName, args.questions);
    const outboundId = await agentmail.sendMessage(ctx, fromEmail, {
      to: toEmail,
      subject,
      text,
      labels: ["beforedoors", "venue-question"],
    });

    const requestId = await ctx.db.insert("venueQuestionRequests", {
      userId: ctx.userId,
      requestKey: args.requestKey,
      venueName: args.venueName,
      venueUrl: args.venueUrl,
      questions: args.questions,
      outboundId: String(outboundId),
    });

    return { requestId, outboundId: String(outboundId) };
  },
});

export const getLatestVenueQuestion = authQuery({
  args: { venueUrl: z.string().max(2048) },
  returns: z.object({
    request: z
      .object({
        _id: zid("venueQuestionRequests"),
        _creationTime: z.number(),
        venueName: z.string(),
        venueUrl: z.string(),
        questions: z.array(z.string()),
        delivery: z
          .object({
            status: z.enum([
              "pending",
              "sent",
              "failed",
              "delivered",
              "bounced",
              "complained",
              "rejected",
            ]),
            agentmailMessageId: z.string().nullable(),
            threadId: z.string().nullable(),
            errorMessage: z.string().nullable(),
          })
          .nullable(),
        replies: z.array(
          z.object({
            messageId: z.string(),
            from: z.string(),
            subject: z.string().nullable(),
            text: z.string(),
            timestamp: z.number(),
          }),
        ),
      })
      .nullable(),
  }),
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("venueQuestionRequests")
      .withIndex("by_user_and_venue_url", (q) =>
        q.eq("userId", ctx.userId).eq("venueUrl", args.venueUrl),
      )
      .order("desc")
      .first();

    if (!request) return { request: null };

    const delivery = await agentmail.status(ctx, request.outboundId as OutboundId);
    const replies = delivery?.threadId
      ? await ctx.runQuery(components.agentmail.lib.listInboundMessages, {
          threadId: delivery.threadId,
        })
      : [];

    return {
      request: {
        _id: request._id,
        _creationTime: request._creationTime,
        venueName: request.venueName,
        venueUrl: request.venueUrl,
        questions: request.questions,
        delivery,
        replies: replies.map((reply: InboundMessageSummary) => ({
          messageId: reply.messageId,
          from: reply.from,
          subject: reply.subject ?? null,
          text: reply.text ?? reply.extractedText ?? reply.preview ?? "",
          timestamp: reply.timestamp,
        })),
      },
    };
  },
});

//#endregion Authenticated functions

//#region Utils

function buildVenueQuestionEmail(venueName: string, questions: string[]) {
  return [
    `Hello ${venueName},`,
    "",
    "I’m checking access information for an upcoming visit and found a few details I could not confirm on your website. Could you help me with the questions below?",
    "",
    ...questions.map((question, index) => `${index + 1}. ${question}`),
    "",
    "Thank you for helping people know what to expect before they go.",
    "",
    "Best,",
    "A BeforeDoors visitor",
    "",
    "Sent from BeforeDoors · Know before you go",
  ].join("\n");
}

type InboundMessageSummary = {
  messageId: string;
  from: string;
  subject?: string;
  text?: string;
  extractedText?: string;
  preview?: string;
  timestamp: number;
};

//#endregion Utils
