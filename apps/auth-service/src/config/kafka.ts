import { KafkaClient } from "@fujibeauty/kafka-client";
import { env } from './env';

export const kafka= new KafkaClient({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS.split(","),
});

