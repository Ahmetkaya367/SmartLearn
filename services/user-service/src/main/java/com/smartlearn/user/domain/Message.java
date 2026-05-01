package com.smartlearn.user.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID senderId;

    @Column(nullable = false)
    private UUID receiverId;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private Instant sentAt;

    @Column(name = "is_read", nullable = false)
    private boolean read;
}
