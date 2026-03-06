package com.gara;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EntityScan("com.gara.entity")
@EnableJpaRepositories("com.gara.modules")
@EnableScheduling
@EnableAsync
@EnableCaching
public class GaraApplication {

    public static void main(String[] args) {
        SpringApplication.run(GaraApplication.class, args);
    }
}
