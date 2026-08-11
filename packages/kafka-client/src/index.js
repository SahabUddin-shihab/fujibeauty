import { Kafka, logLevel } from "kafkajs";
export class KafkaClient {
    options;
    kafka;
    producer = null;
    constructor(options) {
        this.options = options;
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
    async getProducer() {
        if (!this.producer) {
            this.producer = this.kafka.producer();
            await this.producer.connect();
        }
        return this.producer;
    }
    async publish(topic, message, key) {
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
    async subscribe(groupId, topics, onMessage) {
        const consumer = this.kafka.consumer({ groupId });
        await consumer.connect();
        await consumer.subscribe({ topics, fromBeginning: false });
        await consumer.run({
            eachMessage: async (payload) => {
                try {
                    await onMessage(payload);
                }
                catch (error) {
                    console.error(`Error processing message on topic ${payload.topic}:`, error);
                }
            },
        });
        return consumer;
    }
    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }
}
//# sourceMappingURL=index.js.map