package com.smartlearn.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFailedEvent {
    private UUID eventId;
    private UUID orderId;
    private UUID userId;
    private String reason;
    private Instant occurredAt;
}
