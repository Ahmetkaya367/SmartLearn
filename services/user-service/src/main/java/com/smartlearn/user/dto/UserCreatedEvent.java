package com.smartlearn.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserCreatedEvent {
    private String id;
    private String email;
    private String fullName;
    private String role;
}
