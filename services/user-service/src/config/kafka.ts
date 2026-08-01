import { createKafka, KafkaEventConsumer, KafkaEventProducer } from "@ecommerce/kafka-client";
import { env, kafkaBrokers } from "./env";

const kafka = createKafka(env.KAFKA_CLIENT_ID, kafkaBrokers);

export const eventProducer = new KafkaEventProducer(kafka, env.SERVICE_NAME);
export const eventConsumer = new KafkaEventConsumer(kafka, env.KAFKA_CONSUMER_GROUP);
