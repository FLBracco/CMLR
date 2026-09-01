import { IsIn } from "class-validator";
import { SUBSCRIPTION_STATUSES } from "../../professionals/entities/subscription-status.js";
import type { SubscriptionStatus } from "../../professionals/entities/subscription-status.js";

export class UpdateSubscriptionStatusDto {
  @IsIn(SUBSCRIPTION_STATUSES, {
    message: `El estado debe ser uno de: ${SUBSCRIPTION_STATUSES.join(", ")}.`,
  })
  status!: SubscriptionStatus;
}
