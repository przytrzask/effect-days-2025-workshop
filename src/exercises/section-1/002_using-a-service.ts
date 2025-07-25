import { Effect, Console } from "effect"

// A pre-defined list of misbehaviors
import { misbehaviors } from "./fixtures/Misbehaviors.js"
// The tags created in the previous exercise
import { PunDistributionNetwork } from "./shared/services/PunDistributionNetwork.js"
import { PunsterClient } from "./shared/services/PunsterClient.js"

/**
 * **Todo List**:
 *   - Use the services we've defined to write the main program's business
 *     logic in the `main` Effect below
 *
 * **Business Logic**
 *   - For each misbehavior:
 *     - Use the `PunDistributionNetwork` to get a pun delivery channel
 *       for the pun
 *     - Use the `PunsterClient` to create a pun
 *     - Use the `PunDistributionNetwork` to deliver the pun to the delivery
 *       channel
 *     - Log out the result of delivering the pun
 *
 * **Hint**: You'll probably need to access the above services somehow!
 *
 * **Bonus Objectives**:
 *
 *   **Error Handling**:
 *     - Log a warning message if a child had an immunity token
 *     - Log an error message if a pun failed to be fetched from PUNSTER
 *
 *   **Other**:
 *     - Use the `ImmunityTokenManager` to give other children immunity
 *       - check `./fixtures/Misbehaviors.ts` to see the available children
 */

export const main = Effect.gen(function* () {
  const punDeliveryService = yield* PunDistributionNetwork
  const punsterClientService = yield* PunsterClient

  for (const misbehavior of misbehaviors) {
    const channel = yield* punDeliveryService.getChannel(misbehavior)
    yield* punsterClientService.createPun(misbehavior).pipe(
      Effect.andThen((pun) =>
        punDeliveryService.deliverPun(pun, misbehavior, channel),
      ),
      Effect.andThen((report) => Console.log(report)),
      Effect.catchTags({
        ChildImmuneError: () =>
          Console.log(`Child ${misbehavior.childName} had an immunity token`),
        PunsterFetchError: () =>
          Console.error(`Failed to fetch pun from PUNSTER`),
      }),
    )
  }
})
