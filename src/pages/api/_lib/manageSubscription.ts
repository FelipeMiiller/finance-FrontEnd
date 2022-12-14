import { query as q, query } from "faunadb";
import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,

) {
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };

  await fauna.query(
    q.If(
      q.Not(q.Exists(q.Match(q.Index("subscriptions_by_userId"), userRef))),
      q.Create(q.Collection("subscriptions"), { data: subscriptionData }),
      q.Replace( q.Select("ref", q.Get(q.Match(q.Index("subscriptions_by_userId"), userRef)) ), { data: subscriptionData })
    )
  );
}
