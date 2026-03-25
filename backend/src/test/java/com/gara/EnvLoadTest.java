package com.gara;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EnvLoadTest {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Test
    void testEnvLoaded() {
        System.out.println("DEBUG - DB URL: " + dbUrl);
        System.out.println("DEBUG - DB Username: " + dbUsername);
    }
}
