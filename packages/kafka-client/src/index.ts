import { Kafka, Producer, Consumer, EachMessagePayload, logLevel } from "kafkajs";

export interface KafkaClientOptions {
  clientId: string;
  brokers: string[];
}


export class KafkaClient {

  private kafka: Kafka;
  private producer: Producer | null = null;

  constructor(private options: KafkaClientOptions) {
    this.kafka = new Kafka({
      clientId: options.clientId,
      brokers: options.brokers,
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
    });
  }

  async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async publish(topic: string, message: Record<string, unknown>, key?: string): Promise<void> 
  {
    const producer = await this.getProducer();
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
          headers: { "content-type": "application/json" },
        },
      ],
    });
  }

  async subscribe(groupId: string,topics: string[],onMessage: (payload: EachMessagePayload) => Promise<void>): Promise<Consumer> 
  {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topics, fromBeginning: false });
    await consumer.run({
      eachMessage: async (payload) => {
        try {
          await onMessage(payload);
        } catch (error) {
          console.error(`Error processing message on topic ${payload.topic}:`, error);
        }
      },
    });
    return consumer;
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }
}