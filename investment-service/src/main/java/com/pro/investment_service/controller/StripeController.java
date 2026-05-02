package com.pro.investment_service.controller;

import com.pro.investment_service.client.StartupClient;
import com.pro.investment_service.dto.StartupResponse;
import com.pro.investment_service.entity.Investment;
import com.pro.investment_service.repository.InvestmentRepository;
import com.pro.investment_service.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/investments/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeController {

    private final StripeService stripeService;
    private final InvestmentRepository investmentRepository;
    private final StartupClient startupClient;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/create-session")
    @PreAuthorize("hasAnyRole('INVESTOR','ADMIN')")
    public ResponseEntity<Map<String, String>> createSession(@RequestBody Investment investment) {
        log.info("Received request to create Stripe session for Startup: {}, Amount: {}", investment.getStartupId(), investment.getAmount());
        try {
            // 1. Validation
            if (investment.getStartupId() == null || investment.getAmount() == null || investment.getAmount() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid startup ID or amount"));
            }

            // 2. Get Startup info for Checkout page
            String title;
            try {
                StartupResponse startup = startupClient.getStartupById(investment.getStartupId());
                title = (startup != null) ? startup.getTitle() : "Startup #" + investment.getStartupId();
            } catch (Exception e) {
                log.warn("Could not fetch startup title from startup-service: {}", e.getMessage());
                title = "Startup #" + investment.getStartupId(); // Fallback
            }

            // 3. Save investment as PENDING first
            investment.setStatus("PENDING");
            investment.setPaymentStatus("unpaid");
            Investment saved = investmentRepository.save(investment);
            log.info("Saved pending investment with ID: {}", saved.getId());

            // 4. Create Stripe Session
            Session session = stripeService.createCheckoutSession(saved, title);
            log.info("Stripe session created: {}", session.getId());

            // 5. Update investment with Session ID
            saved.setStripeSessionId(session.getId());
            investmentRepository.save(saved);

            return ResponseEntity.ok(Map.of("sessionUrl", session.getUrl()));
        } catch (StripeException e) {
            log.error("Stripe error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Stripe Error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating session: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Server Error: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            log.error("Webhook signature verification failed: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                handleSuccessfulPayment(session);
            }
        }

        return ResponseEntity.ok("Success");
    }

    private void handleSuccessfulPayment(Session session) {
        String investmentId = session.getMetadata().get("investmentId");
        if (investmentId != null) {
            investmentRepository.findById(Long.parseLong(investmentId)).ifPresent(inv -> {
                inv.setStatus("APPROVED");
                inv.setPaymentStatus("paid");
                investmentRepository.save(inv);
                log.info("Investment {} marked as PAID and APPROVED", investmentId);
            });
        }
    }
}
