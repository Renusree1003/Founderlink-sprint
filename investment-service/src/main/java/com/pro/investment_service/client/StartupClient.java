package com.pro.investment_service.client;

import com.pro.investment_service.config.FeignConfig;
import com.pro.investment_service.dto.StartupResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "startup-service", configuration = FeignConfig.class)
public interface StartupClient {

    @GetMapping("/startups/{id}")
    StartupResponse getStartupById(@PathVariable("id") Long id);
}
