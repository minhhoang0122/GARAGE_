package com.gara.dto;

import java.math.BigDecimal;

public class FinancialTransactionRequest {
    private BigDecimal amount;
    private String type; // INCOME, EXPENSE, DEPOSIT, PAYMENT
    private String method; // CASH, BANK_TRANSFER
    private String referenceCode;
    private String note;

    public FinancialTransactionRequest() {
    }

    public FinancialTransactionRequest(BigDecimal amount, String type, String method, String referenceCode, String note) {
        this.amount = amount;
        this.type = type;
        this.method = method;
        this.referenceCode = referenceCode;
        this.note = note;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
