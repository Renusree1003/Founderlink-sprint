package com.pro.investment_service.service;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.pro.investment_service.entity.Investment;
import com.pro.investment_service.repository.InvestmentRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentRepository repo;

    public Investment create(Investment investment) {
        investment.setStatus("PENDING");
        return repo.save(investment);
    }

    public Investment updateStatus(Long id, String status) {
        Investment inv = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Investment not found"));

        inv.setStatus(status);
        return repo.save(inv);
    }

    public List<Investment> getByStartup(Long startupId) {
        return repo.findByStartupId(startupId);
    }

    public List<Investment> getByInvestor(Long investorId) {
        return repo.findByInvestorId(investorId);
    }

    public List<Investment> getAll() {
        return repo.findAll();
    }
}
