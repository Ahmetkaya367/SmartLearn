package com.smartlearn.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiatedEvent {
    private UUID eventId;
    private UUID orderId;
    private UUID userId;
    private BigDecimal amount;
    private List<UUID> courseIds;
    private Instant occurredAt;
}
