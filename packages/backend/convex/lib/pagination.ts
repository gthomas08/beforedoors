import { paginationResultValidator } from "convex/server";
import { convexToZod } from "convex-helpers/server/zod4";
import type { GenericValidator } from "convex/values";

export function paginationResultSchema<ItemValidator extends GenericValidator>(
  itemValidator: ItemValidator,
) {
  return convexToZod(paginationResultValidator(itemValidator));
}
