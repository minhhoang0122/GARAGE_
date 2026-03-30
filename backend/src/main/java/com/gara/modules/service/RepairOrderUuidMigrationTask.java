package com.gara.modules.service;

import com.gara.entity.RepairOrder;
import com.gara.modules.service.repository.RepairOrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
public class RepairOrderUuidMigrationTask implements CommandLineRunner {

    private final RepairOrderRepository repairOrderRepository;

    public RepairOrderUuidMigrationTask(RepairOrderRepository repairOrderRepository) {
        this.repairOrderRepository = repairOrderRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Find all orders that don't have a UUID
        List<RepairOrder> ordersWithoutUuid = repairOrderRepository.findAll().stream()
                .filter(o -> o.getUuid() == null)
                .toList();

        if (!ordersWithoutUuid.isEmpty()) {
            System.out.println("Migrating " + ordersWithoutUuid.size() + " repair orders to add UUIDs...");
            for (RepairOrder order : ordersWithoutUuid) {
                order.setUuid(UUID.randomUUID());
            }
            repairOrderRepository.saveAll(ordersWithoutUuid);
            System.out.println("UUID migration completed successfully.");
        }
    }
}
