package com.gara.dto;

public record AssignmentDTO(
    Integer id,
    Integer mechanicId,
    String mechanicName,
    String mechanicAvatar,
    Boolean isMain
) {}
