package com.pro.config_server;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ConfigServerApplicationTests {

	@Test
	@Disabled("Temporarily disabled for CI: context-load test depends on full runtime infra")
	void contextLoads() {
	}

}



