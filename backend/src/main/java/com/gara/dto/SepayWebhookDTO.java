package com.gara.dto;

import java.math.BigDecimal;

public class SepayWebhookDTO {
    private String id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String code;
    private String content; // Nội dung chuyển khoản
    private String transferType; // "in" or "out"
    private BigDecimal transferAmount;
    private BigDecimal accumulated;
    private String subAccount;
    private String referenceCode;
    private String description;

    public SepayWebhookDTO() {}

    public SepayWebhookDTO(String id, String gateway, String transactionDate, String accountNumber, String code, 
                           String content, String transferType, BigDecimal transferAmount, 
                           BigDecimal accumulated, String subAccount, String referenceCode, String description) {
        this.id = id;
        this.gateway = gateway;
        this.transactionDate = transactionDate;
        this.accountNumber = accountNumber;
        this.code = code;
        this.content = content;
        this.transferType = transferType;
        this.transferAmount = transferAmount;
        this.accumulated = accumulated;
        this.subAccount = subAccount;
        this.referenceCode = referenceCode;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }
    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTransferType() { return transferType; }
    public void setTransferType(String transferType) { this.transferType = transferType; }
    public BigDecimal getTransferAmount() { return transferAmount; }
    public void setTransferAmount(BigDecimal transferAmount) { this.transferAmount = transferAmount; }
    public BigDecimal getAccumulated() { return accumulated; }
    public void setAccumulated(BigDecimal accumulated) { this.accumulated = accumulated; }
    public String getSubAccount() { return subAccount; }
    public void setSubAccount(String subAccount) { this.subAccount = subAccount; }
    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
