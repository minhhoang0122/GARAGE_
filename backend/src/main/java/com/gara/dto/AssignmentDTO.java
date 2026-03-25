package com.gara.dto;

public record AssignmentDTO(
    Integer id,
    Integer mechanicId,
    String mechanicName,
    Boolean isMain
) {}
