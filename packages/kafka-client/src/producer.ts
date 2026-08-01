import { Kafka, Producer, CompressionTypes } from "kafkajs";
import { randomUUID } from "crypto";
import { DomainEvent, EventTopic } from "./topics";

export class KafkaEventProducer {
  private readonly producer: Producer;
  private connected = false;

  constructor(
    private readonly kafka: Kafka,
    private readonly serviceName: string
  ) {
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.producer.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    await this.producer.disconnect();
    this.connected = false;
  }

  async publish<TPayload>(topic: EventTopic, payload: TPayload, key?: string): Promise<void> {
    const event: DomainEvent<TPayload> = {
      eventId: randomUUID(),
      eventType: topic,
      occurredAt: new Date().toISOString(),
      producer: this.serviceName,
      payload
    };

    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: key ?? event.eventId,
          value: JSON.stringify(event),
          headers: { "content-type": "application/json", producer: this.serviceName }
        }
      ]
    });
  }
}

export function createKafka(clientId: string, brokers: string[]): Kafka {
  return new Kafka({
    clientId,
    brokers,
    retry: { initialRetryTime: 300, retries: 8 }
  });
}
