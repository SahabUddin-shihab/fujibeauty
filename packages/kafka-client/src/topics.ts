/**
 * Canonical Kafka topic names. Every service imports from here so producers
 * and consumers never drift out of sync on topic naming.
 */
export enum EventTopic {
  UserRegistered = "user.registered",
  UserUpdated = "user.updated",
  ProductCreated = "product.created",
  ProductUpdated = "product.updated",
  InventoryUpdated = "inventory.updated",
  InventoryReserved = "inventory.reserved",
  InventoryReleased = "inventory.released",
  CartCheckedOut = "cart.checked-out",
  OrderCreated = "order.created",
  OrderConfirmed = "order.confirmed",
  OrderCancelled = "order.cancelled",
  PaymentSucceeded = "payment.succeeded",
  PaymentFailed = "payment.failed",
  EmailRequested = "email.requested",
  NotificationRequested = "notification.requested"
}

export interface DomainEvent<TPayload = unknown> {
  eventId: string;
  eventType: EventTopic;
  occurredAt: string;
  producer: string;
  payload: TPayload;
}
