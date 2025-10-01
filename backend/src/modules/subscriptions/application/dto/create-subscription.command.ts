export type CreateSubscriptionCommand = {
  userId: string;
  planId: string;
  customer: {
    name: string;
    email: string;
  };
};
