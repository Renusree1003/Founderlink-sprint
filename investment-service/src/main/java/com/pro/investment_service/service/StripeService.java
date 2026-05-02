package com.pro.investment_service.service;

import com.pro.investment_service.entity.Investment;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Session createCheckoutSession(Investment investment, String startupTitle) throws StripeException {
        String baseUrl = frontendUrl != null ? frontendUrl.trim() : "http://localhost:5173";
        
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(baseUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(baseUrl + "/payment/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("inr")
                                                .setUnitAmount((long) (investment.getAmount() * 100)) // Amount in paise
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Investment in " + startupTitle)
                                                                .setDescription("Equity investment via FounderLink")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .putMetadata("investmentId", investment.getId().toString())
                .putMetadata("startupId", investment.getStartupId().toString())
                .build();

        return Session.create(params);
    }
}
