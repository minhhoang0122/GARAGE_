package com.gara.config;

import com.gara.modules.inventory.repository.*;

import com.gara.modules.auth.repository.*;
import com.gara.modules.customer.repository.*;
import com.gara.modules.service.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Warmup component that pre-loads frequently accessed data into cache
 * immediately after application startup for faster first requests.
 */
@Component
public class StartupWarmup {

    private static final Logger log = LoggerFactory.getLogger(StartupWarmup.class);

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final RepairOrderRepository orderRepository;

    public StartupWarmup(ProductRepository productRepository,
            CustomerRepository customerRepository,
            UserRepository userRepository,
            RepairOrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void warmupCaches() {
        log.info("Starting cache warmup...");
        long start = System.currentTimeMillis();

        try {
            // Warmup products (most frequently accessed)
            productRepository.findProductsPaginated();
            log.info("Products cache warmed up");

            // Warmup customers
            customerRepository.findRecentCustomers();
            log.info("Customers cache warmed up");

            // Warmup users
            userRepository.findAll();
            log.info("Users cache warmed up");

            // Warmup recent orders with relations
            orderRepository.findAllOrdersOptimized();
            log.info("Orders cache warmed up");

            // Warmup inspection orders
            orderRepository.findOrdersForInspection();
            log.info("Inspection orders cache warmed up");

            // Warmup mechanic jobs
            orderRepository.findJobsForMechanic();
            log.info("Mechanic jobs cache warmed up");

        } catch (Exception e) {
            log.warn("Cache warmup partially failed: {}", e.getMessage());
        }

        long elapsed = System.currentTimeMillis() - start;
        log.info("Cache warmup completed in {} ms", elapsed);
    }
}
