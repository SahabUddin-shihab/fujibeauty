export enum KafkaTopics {
  USER_REGISTERED = "user.registered",
  USER_LOGGED_IN = "user.logged-in",
  PRODUCT_CREATED = "product.created",
  ORDER_CREATED = "order.created",
  PAYMENT_SUCCEEDED = "payment.succeeded",
  ORDER_CONFIRMED = "order.confirmed",
  ORDER_CANCELLED = "order.cancelled",
  EMAIL_REQUESTED = "email.requested",
}

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  registeredAt: string;
}

export interface UserLoggedInEvent {
  userId: string;
  email: string;
  loggedInAt: string;
}

export interface EmailRequestedEvent {
  to: string;
  subject: string;
  template: "welcome" | "order-confirmation" | "password-reset";
  data: Record<string, unknown>;
}

export interface ProductCreatedEvent {
  productId: string;
  name: string;
  price: string;
  categoryId: string;
  vendorId: string;
  createdAt: string;
}

export interface OrderItemEvent {
  productId: string;
  name: string;
  quantity: number;
  price: string;
}

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  userEmail: string;
  items: OrderItemEvent[];
  totalAmount: string;
  createdAt: string;
}

export interface PaymentSucceededEvent {
  orderId: string;
  userId: string;
  userEmail: string;
  amount: string;
  paymentId: string;
  paidAt: string;
}

export interface OrderConfirmedEvent {
  orderId: string;
  userId: string;
  userEmail: string;
  confirmedAt: string;
}

export interface OrderCancelledEvent {
  orderId: string;
  userId: string;
  reason: string;
  cancelledAt: string;
}
