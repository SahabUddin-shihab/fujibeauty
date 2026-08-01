import { createKafka, KafkaEventProducer } from "@ecommerce/kafka-client";
import { env, kafkaBrokers } from "./env";

const kafka = createKafka(env.KAFKA_CLIENT_ID, kafkaBrokers);

export const eventProducer = new KafkaEventProducer(kafka, env.SERVICE_NAME);
