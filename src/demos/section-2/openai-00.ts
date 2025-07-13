import { NodeRuntime } from "@effect/platform-node"
import { Config, Data, Effect, Layer, Redacted } from "effect"
import * as Api from "openai"
import { TracingLayer } from "../../Tracing.js"

class OpenAiError extends Data.TaggedClass("OpenAiError")<{
  cause: unknown
}> {




}

export class OpenAi extends Effect.Service<OpenAi>()("OpenAi", {
  effect: Effect.gen(function*() {
    const client = new Api.OpenAI({
      apiKey:  Redacted.value(yield* Config.redacted("OPENAI_API_KEY"))
    })




  const use = <A>(f: (client: Api.OpenAI) => Promise<A>): Effect.Effect<A, OpenAiError>   => Effect.tryPromise({
      try: () => f(client),
      catch: (cause) => new OpenAiError({ cause })
    })


    return {use } as const
  })
}) {}

// usage

Effect.gen(function*() {
  const openai = yield* OpenAi

  const result = yield* openai.use((client) =>
    client.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: "What is the meaning of life?"
      }]
    }, { signal })
  )

  yield* Effect.log(result.choices)
}).pipe(
  Effect.provide(OpenAi.Default.pipe(
    Layer.provideMerge(TracingLayer)
  )),
  NodeRuntime.runMain
)
