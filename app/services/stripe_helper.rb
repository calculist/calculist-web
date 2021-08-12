class StripeHelper
  def initialize(secret_key: Rails.application.secrets.stripe_secret_key)
    Stripe.api_key = secret_key
  end

  def valid_plan?(plan)
    plan == 'personal' || plan == 'professional'
  end

  def get_products
    Stripe::Product.list
  end

  def get_customers
    Stripe::Customer.list
  end

  def get_customer_for_user(user_id)
    user = User.find(user_id)
    return nil unless user
    ba = BetaAccess
      .where(claimed_by: user_id)
      .where("notes like 'stripe:cus%'").first
    return nil unless ba
    sc_id = ba.notes.split(':')[1]
    sc = Stripe::Customer.retrieve(sc_id)
    sc
  end

  def price_from_plan(plan)
    {
      'personal' => ENV['STRIPE_PERSONAL_PLAN_ID'],
      'professional' => ENV['STRIPE_PRO_PLAN_ID']
    }[plan]
  end

  def create_checkout_session(plan, customer_email = nil, client_reference_id = nil)
    Stripe::Checkout::Session.create(
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: price_from_plan(plan), quantity: 1 }],
        # customer: customer,
        client_reference_id: client_reference_id,
        customer_email: customer_email,
        success_url: "#{ENV['APP_BASE_URL']}/subscribe/complete_checkout?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "#{ENV['CALCULIST_MAIN_URL']}/pricing?cancel=true",
    )
  end

  def get_checkout_session(session_id)
    Stripe::Checkout::Session.retrieve(session_id)
  end

  def create_customer_portal_session(user_id)
    customer = get_customer_for_user(user_id)
    return nil if customer.nil?
    Stripe::BillingPortal::Session.create({
      customer: customer.id,
      return_url: "#{ENV['APP_BASE_URL']}/settings",
    })
  end
end
