package com.gara.modules.customer.repository;

import com.gara.entity.Customer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByUserId(Integer userId);

    @Query("SELECT c FROM Customer c WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR c.phone LIKE CONCAT('%', :keyword, '%')")
    List<Customer> searchByKeyword(@Param("keyword") String keyword);

    // Optimized: Get recent customers with pagination (default 50)
    @Query("SELECT c FROM Customer c ORDER BY c.createdAt DESC")
    List<Customer> findRecentCustomers(Pageable pageable);

    default List<Customer> findRecentCustomers() {
        return findRecentCustomers(org.springframework.data.domain.PageRequest.of(0, 50));
    }

    @Query("SELECT c FROM Customer c WHERE c.phone = :phone")
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    java.util.Optional<Customer> findByPhoneWithLock(
            @org.springframework.data.repository.query.Param("phone") String phone);
}
