package com.smartlearn.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthDetails {
    private UUID id;
    private String role;
    private String status;
    private boolean active;
}
