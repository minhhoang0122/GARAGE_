package com.gara.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProposalItemDTO(Integer productId, Integer quantity, String note) {
}
