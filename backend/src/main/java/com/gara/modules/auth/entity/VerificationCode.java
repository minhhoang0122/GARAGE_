package com.gara.modules.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_codes")
public class VerificationCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String registrationData;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // Manual No-Args Constructor
    public VerificationCode() {}

    // Manual All-Args Constructor
    public VerificationCode(Long id, String email, String code, String registrationData, LocalDateTime expiryDate) {
        this.id = id;
        this.email = email;
        this.code = code;
        this.registrationData = registrationData;
        this.expiryDate = expiryDate;
    }

    // Manual Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getRegistrationData() { return registrationData; }
    public void setRegistrationData(String registrationData) { this.registrationData = registrationData; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    // Manual Builder Pattern to fix compilation error
    public static VerificationCodeBuilder builder() {
        return new VerificationCodeBuilder();
    }

    public static class VerificationCodeBuilder {
        private String email;
        private String code;
        private String registrationData;
        private LocalDateTime expiryDate;

        public VerificationCodeBuilder email(String email) {
            this.email = email;
            return this;
        }

        public VerificationCodeBuilder code(String code) {
            this.code = code;
            return this;
        }

        public VerificationCodeBuilder registrationData(String registrationData) {
            this.registrationData = registrationData;
            return this;
        }

        public VerificationCodeBuilder expiryDate(LocalDateTime expiryDate) {
            this.expiryDate = expiryDate;
            return this;
        }

        public VerificationCode build() {
            VerificationCode v = new VerificationCode();
            v.setEmail(email);
            v.setCode(code);
            v.setRegistrationData(registrationData);
            v.setExpiryDate(expiryDate);
            return v;
        }
    }
}
