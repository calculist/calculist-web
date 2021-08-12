class SubscriptionsController < ApplicationController
  # 1. Select a plan and enter your email.
  # 2. Checkout through stripe.
  # 3. If you do not have an account, create your username and password.
  def index
    if current_user
      # Does this user already have a stripe customer record?
      if current_stripe_customer
        redirect_to 'subscribe/manage'
        return
      elsif params[:plan]
        # TODO attach user id to stripe customer metadata
        stripe_checkout_session = sh.create_checkout_session(
          params[:plan], current_user.email, current_user.id
        )
        @plan = params[:plan]
        @stripe_checkout_session_id = stripe_checkout_session['id']
        @current_user_email = current_user.email
        render 'devise/registrations/stripe_checkout'
        return
      else
        redirect_to "#{ENV['CALCULIST_MAIN_URL']}/pricing"
      end
    elsif params[:plan]
      redirect_to "/join?plan=#{params[:plan]}"
    else
      redirect_to "#{ENV['CALCULIST_MAIN_URL']}/pricing"
    end
  end

  def show
    if current_user
    end
  end

  def complete_checkout
    if params[:session_id]
      stripe_checkout_session = sh.get_checkout_session(params[:session_id])
      if stripe_checkout_session && stripe_checkout_session['payment_status'] == 'paid'
        invite_code = BetaAccess.create(
          notes: "stripe:#{stripe_checkout_session['customer']}",
          claimed_by: current_user ? current_user.id : nil,
          claimed_at: current_user ? DateTime.now : nil,
        ).code
        if current_user
          redirect_to '/thankyou'
        else
          email = stripe_checkout_session['customer_details']['email']
          redirect_to "/join?email=#{email}&code=#{invite_code}"
        end
      else
        # redirect ???
        raise 'error'
      end
    end
  end

  def thankyou
  end

  def get_stripe_checkout_session
    if params[:email] && params[:plan] && sh.valid_plan?(params[:plan])
      if current_user && current_user.email != params[:email]
        # error
      elsif current_user && current_user.email == params[:email]
        stripe_checkout_session = sh.create_checkout_session(params[:plan], params[:email])
      elsif current_user.nil?
        existing_user = User.where(email: params[:email]).first
        if existing_user
          render status: 409, json: { message: 'email taken' }
          return
        else
          stripe_checkout_session = sh.create_checkout_session(params[:plan], params[:email])
        end
      end
    end

    if stripe_checkout_session
      render json: {
        stripe_checkout_session_id: stripe_checkout_session['id'],
        plan: params[:plan],
      }
    else
      # error message
    end
  end

  def manage_subscription
    redirect_to '' unless current_user
    session = sh.create_customer_portal_session(current_user.id)
    if session.nil?
      redirect_to '/subscribe'
    else
      redirect_to session.url
    end
  end

  private

  def current_stripe_customer
    return nil unless current_user
    return @csc if defined?(@csc)
    @csc = sh.get_customer_for_user(current_user.id)
  end

  def sh
    @sh ||= StripeHelper.new
  end
end
