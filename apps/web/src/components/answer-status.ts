export type AnswerStatus = "published" | "confirmed";

export const answerStatusMeta: Record<
  AnswerStatus,
  {
    dotClassName: string;
    label: string;
    shortLabel: string;
  }
> = {
  published: {
    dotClassName: "bg-(--status-published)",
    label: "Published by venue",
    shortLabel: "Published",
  },
  confirmed: {
    dotClassName: "bg-(--status-confirmed)",
    label: "Confirmed by venue",
    shortLabel: "Confirmed",
  },
};
