import { Kafka, Consumer, EachMessagePayload } from "kafkajs";
import { DomainEvent, EventTopic } from "./topics";

export type EventHandler<TPayload = unknown> = (event: DomainEvent<TPayload>) => Promise<void>;

export class KafkaEventConsumer {
  private readonly consumer: Consumer;
  private readonly handlers = new Map<EventTopic, EventHandler>();

  constructor(
    private readonly kafka: Kafka,
    private readonly groupId: string,
    private readonly onError?: (err: unknown, payload: EachMessagePayload) => Promise<void>
  ) {
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
  }

  on<TPayload>(topic: EventTopic, handler: EventHandler<TPayload>): this {
    this.handlers.set(topic, handler as EventHandler);
    return this;
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    const topics = Array.from(this.handlers.keys());
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async (messagePayload: EachMessagePayload) => {
        const { topic, message } = messagePayload;
        const handler = this.handlers.get(topic as EventTopic);
        if (!handler || !message.value) return;

        try {
          const event = JSON.parse(message.value.toString()) as DomainEvent;
          await handler(event);
        } catch (err) {
          if (this.onError) {
            await this.onError(err, messagePayload);
          } else {
            // Re-throw so KafkaJS's retry/backoff kicks in rather than silently dropping events.
            throw err;
          }
        }
      }
    });
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }
}
