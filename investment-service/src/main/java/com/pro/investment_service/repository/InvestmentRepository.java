package com.pro.investment_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pro.investment_service.entity.Investment;

import java.util.List;

import org.springframework.stereotype.Repository;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByStartupId(Long startupId);

    List<Investment> findByInvestorId(Long investorId);
}
