package com.smartlearn.user.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AuthUserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String status;
    private boolean active;
}
