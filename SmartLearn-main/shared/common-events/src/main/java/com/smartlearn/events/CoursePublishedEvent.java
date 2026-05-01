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
public class CoursePublishedEvent {
    private UUID eventId;
    private UUID courseId;
    private UUID instructorId;
    private String title;
    private Instant occurredAt;
}
