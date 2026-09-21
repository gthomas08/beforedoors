import { AgentMail, type OutboundId } from "./components/agentmail/client/index.js";
import { components, internal } from "./_generated/api";
import { env, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { convexToZod } from "convex-helpers/server/zod4";
import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";
import { authMutation, authQuery } from "./lib/customFunctions";
import { paginationResultSchema } from "./lib/pagination";

const MAX_QUESTIONS = 10;

const deliveryStatusSchema = z.enum([
  "pending",
  "sent",
  "failed",
  "delivered",
  "bounced",
  "complained",
  "rejected",
]);

const vDeliveryStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("delivered"),
  v.literal("bounced"),
  v.literal("complained"),
  v.literal("rejected"),
);

const accountMessageValidator = v.object({
  id: v.string(),
  direction: v.union(v.literal("sent"), v.literal("received")),
  from: v.union(v.string(), v.null()),
  to: v.array(v.string()),
  subject: v.union(v.string(), v.null()),
  text: v.string(),
  timestamp: v.number(),
  status: v.union(vDeliveryStatus, v.null()),
});

const accountThreadValidator = v.object({
  id: v.id("venueQuestionRequests"),
  threadId: v.union(v.string(), v.null()),
  venueName: v.string(),
  venueUrl: v.string(),
  subject: v.string(),
  timestamp: v.number(),
  status: vDeliveryStatus,
  replyCount: v.number(),
  errorMessage: v.union(v.string(), v.null()),
  messages: v.array(accountMessageValidator),
});

const accountMessageSchema = convexToZod(accountMessageValidator);

type AccountMessage = z.infer<typeof accountMessageSchema>;
type OutboundStatusSummary = {
  status: z.infer<typeof deliveryStatusSchema>;
  threadId: string | null;
  errorMessage: string | null;
};

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

    const inboxId = env.AGENTMAIL_INBOX_ID;
    const venue = await ctx.db
      .query("venues")
      .withIndex("by_url", (q) => q.eq("url", args.venueUrl))
      .unique();
    const toEmail = venue?.contactEmail?.trim();
    if (!inboxId) throw new Error("AgentMail is not configured: set AGENTMAIL_INBOX_ID");
    if (!isDeliverableContactEmail(toEmail))
      throw new Error(
        "This venue does not have a verified public contact email yet. Try again after the venue research is refreshed.",
      );

    const recipientVenueName = venue?.name || args.venueName;
    const subject = `A question from BeforeDoors · ${recipientVenueName}`;
    const text = buildVenueQuestionEmail(recipientVenueName, args.questions);
    const outboundId = await agentmail.sendMessage(ctx, inboxId, {
      to: toEmail,
      subject,
      text,
      labels: ["beforedoors", "venue-question"],
    });

    const requestId = await ctx.db.insert("venueQuestionRequests", {
      userId: ctx.userId,
      requestKey: args.requestKey,
      venueName: recipientVenueName,
      venueUrl: args.venueUrl,
      recipientEmail: toEmail,
      questions: args.questions,
      outboundId: String(outboundId),
    });

    // AgentMail sends through its workpool, so capture the remote thread ID
    // asynchronously before inbound replies begin arriving.
    await ctx.scheduler.runAfter(0, internal.venueQuestions.syncVenueQuestionThread, {
      requestId,
      outboundId: String(outboundId),
      attempt: 0,
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

export const listMyEmailThreads = authQuery({
  args: { paginationOpts: convexToZod(paginationOptsValidator) },
  returns: paginationResultSchema(accountThreadValidator),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("venueQuestionRequests")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const threads = await Promise.all(
      page.page.map(async (request) => {
        const delivery = (await ctx.runQuery(components.agentmail.lib.getOutboundStatus, {
          outboundId: request.outboundId,
        })) as OutboundStatusSummary | null;
        const replies = delivery?.threadId
          ? ((await ctx.runQuery(components.agentmail.lib.listInboundMessages, {
              threadId: delivery.threadId,
            })) as InboundMessageSummary[])
          : [];
        const subject = `A question from BeforeDoors · ${request.venueName}`;
        const sentMessage: AccountMessage = {
          id: request.outboundId,
          direction: "sent",
          from: env.AGENTMAIL_INBOX_ID ?? null,
          to: [request.recipientEmail],
          subject,
          text: buildVenueQuestionEmail(request.venueName, request.questions),
          timestamp: request._creationTime,
          status: delivery?.status ?? "pending",
        };
        const receivedMessages: AccountMessage[] = replies.map((reply) => ({
          id: reply.messageId,
          direction: "received",
          from: reply.from,
          to: reply.to ?? [],
          subject: reply.subject ?? null,
          text: reply.text ?? reply.extractedText ?? reply.preview ?? "",
          timestamp: reply.timestamp,
          status: null,
        }));

        return {
          id: request._id,
          threadId: delivery?.threadId ?? null,
          venueName: request.venueName,
          venueUrl: request.venueUrl,
          subject,
          timestamp: request._creationTime,
          status: delivery?.status ?? "pending",
          replyCount: receivedMessages.length,
          errorMessage: delivery?.errorMessage ?? null,
          messages: [sentMessage, ...receivedMessages].sort(
            (left, right) => left.timestamp - right.timestamp,
          ),
        };
      }),
    );

    return { ...page, page: threads };
  },
});

//#endregion Authenticated functions

//#region Private functions

export const setVenueQuestionThread = internalMutation({
  args: {
    requestId: v.id("venueQuestionRequests"),
    threadId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (request === null || request.threadId === args.threadId) return null;

    await ctx.db.patch(args.requestId, { threadId: args.threadId });
    return null;
  },
});

export const syncVenueQuestionThread = internalAction({
  args: {
    requestId: v.id("venueQuestionRequests"),
    outboundId: v.string(),
    attempt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const status = await ctx.runQuery(components.agentmail.lib.getOutboundStatus, {
      outboundId: args.outboundId,
    });

    if (status?.threadId) {
      await ctx.runMutation(internal.venueQuestions.setVenueQuestionThread, {
        requestId: args.requestId,
        threadId: status.threadId,
      });
      return null;
    }

    // The AgentMail workpool may still be sending the message. Poll briefly,
    // without retrying indefinitely if the send fails or remains pending.
    if (args.attempt < 20) {
      await ctx.scheduler.runAfter(1000, internal.venueQuestions.syncVenueQuestionThread, {
        requestId: args.requestId,
        outboundId: args.outboundId,
        attempt: args.attempt + 1,
      });
    }

    return null;
  },
});

export const handleVenueReplyReceived = internalMutation({
  args: {
    message: v.any(),
    thread: v.any(),
    eventId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = asRecord(args.message);
    const thread = asRecord(args.thread);
    const messageId = firstString(message.message_id, message.id);
    const threadId = firstString(message.thread_id, thread.thread_id, thread.id);
    const body = firstString(
      message.extracted_text,
      message.text,
      message.preview,
      message.extracted_html,
      message.html,
    );

    // Ignore malformed events rather than creating an unmatchable extraction.
    if (!messageId || !threadId || !body) return null;

    const request = await ctx.db
      .query("venueQuestionRequests")
      .withIndex("by_thread_id", (q) => q.eq("threadId", threadId))
      .unique();
    if (request === null) return null;

    const existing = await ctx.db
      .query("venueReplyExtractions")
      .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
      .unique();
    if (existing !== null) return null;

    const from = firstString(message.from) ?? "";
    const subject = firstString(message.subject);
    const extractionId = await ctx.db.insert("venueReplyExtractions", {
      requestId: request._id,
      messageId,
      eventId: args.eventId,
      threadId,
      from,
      ...(subject ? { subject } : {}),
      body: body.slice(0, 60_000),
      status: "queued",
      answerCount: 0,
    });

    await ctx.scheduler.runAfter(0, internal.venueReplyExtraction.processVenueReply, {
      extractionId,
    });

    return null;
  },
});

export const getVenueReplyExtractionInput = internalQuery({
  args: { extractionId: v.id("venueReplyExtractions") },
  returns: v.union(
    v.null(),
    v.object({
      extraction: v.object({
        _id: v.id("venueReplyExtractions"),
        requestId: v.id("venueQuestionRequests"),
        from: v.string(),
        subject: v.union(v.string(), v.null()),
        body: v.string(),
        status: v.union(
          v.literal("queued"),
          v.literal("completed"),
          v.literal("skipped"),
          v.literal("failed"),
        ),
      }),
      request: v.object({
        _id: v.id("venueQuestionRequests"),
        venueName: v.string(),
        venueUrl: v.string(),
        questions: v.array(v.string()),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const extraction = await ctx.db.get("venueReplyExtractions", args.extractionId);
    if (extraction === null) return null;

    const request = await ctx.db.get("venueQuestionRequests", extraction.requestId);
    if (request === null) return null;

    return {
      extraction: {
        _id: extraction._id,
        requestId: extraction.requestId,
        from: extraction.from,
        subject: extraction.subject ?? null,
        body: extraction.body,
        status: extraction.status,
      },
      request: {
        _id: request._id,
        venueName: request.venueName,
        venueUrl: request.venueUrl,
        questions: request.questions,
      },
    };
  },
});

export const applyVenueReplyExtraction = internalMutation({
  args: {
    extractionId: v.id("venueReplyExtractions"),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
        answer: v.string(),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const extraction = await ctx.db.get("venueReplyExtractions", args.extractionId);
    if (extraction === null || extraction.status !== "queued") return null;

    const request = await ctx.db.get("venueQuestionRequests", extraction.requestId);
    if (request === null) {
      await ctx.db.patch(args.extractionId, {
        status: "failed",
        error: "The original venue question request no longer exists.",
      });
      return null;
    }

    const venue = await ctx.db
      .query("venues")
      .withIndex("by_url", (q) => q.eq("url", request.venueUrl))
      .unique();
    if (venue === null) {
      await ctx.db.patch(args.extractionId, {
        status: "skipped",
        error: "The venue no longer exists in the saved venue list.",
      });
      return null;
    }

    const seenQuestionIndexes = new Set<number>();
    const confirmedAnswers = args.answers.filter((item) => {
      const questionIndex = Math.trunc(item.questionIndex);
      const answer = item.answer.trim();
      if (
        questionIndex < 0 ||
        questionIndex >= request.questions.length ||
        answer.length === 0 ||
        seenQuestionIndexes.has(questionIndex)
      ) {
        return false;
      }
      seenQuestionIndexes.add(questionIndex);
      return true;
    });

    if (confirmedAnswers.length === 0) {
      await ctx.db.patch(args.extractionId, { status: "skipped", answerCount: 0 });
      return null;
    }

    const lastAnswer = await ctx.db
      .query("venueAnswers")
      .withIndex("by_venue_and_answer_index", (q) => q.eq("venueId", venue._id))
      .order("desc")
      .first();
    const firstAnswerIndex = (lastAnswer?.answerIndex ?? -1) + 1;
    if (firstAnswerIndex + confirmedAnswers.length > 1000) {
      await ctx.db.patch(args.extractionId, {
        status: "failed",
        error: "The venue has reached the supported answer limit.",
      });
      return null;
    }

    for (const [offset, item] of confirmedAnswers.entries()) {
      const question = request.questions[Math.trunc(item.questionIndex)];
      const answer = item.answer.trim();
      await ctx.db.insert("venueAnswers", {
        venueId: venue._id,
        answerIndex: firstAnswerIndex + offset,
        language: venue.researchLanguage,
        question,
        answer,
        url: request.venueUrl,
        status: "confirmed",
        searchText: `${question}\n${answer}`,
      });
    }

    await ctx.db.patch(venue._id, {
      answerCount: venue.answerCount + confirmedAnswers.length,
      confirmedCount: venue.confirmedCount + confirmedAnswers.length,
      updatedAt: Date.now(),
    });
    await ctx.db.patch(args.extractionId, {
      status: "completed",
      answerCount: confirmedAnswers.length,
    });

    return null;
  },
});

export const markVenueReplyExtractionFailed = internalMutation({
  args: {
    extractionId: v.id("venueReplyExtractions"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const extraction = await ctx.db.get("venueReplyExtractions", args.extractionId);
    if (extraction === null || extraction.status !== "queued") return null;

    await ctx.db.patch(args.extractionId, {
      status: "failed",
      error: args.error.slice(0, 1000),
    });
    return null;
  },
});

//#endregion Private functions

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

function isDeliverableContactEmail(value: string | undefined): value is string {
  const email = value?.trim().toLowerCase();
  return email !== undefined && email.length > 0 && !email.endsWith(".invalid");
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

type InboundMessageSummary = {
  messageId: string;
  from: string;
  to?: string[];
  subject?: string;
  text?: string;
  extractedText?: string;
  preview?: string;
  timestamp: number;
};

//#endregion Utils
