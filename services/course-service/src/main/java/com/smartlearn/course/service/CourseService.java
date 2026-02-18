package com.smartlearn.course.service;

import com.smartlearn.course.domain.Course;
import com.smartlearn.course.domain.CourseStatus;
import com.smartlearn.course.dto.CourseResponse;
import com.smartlearn.course.dto.LessonDto;
import com.smartlearn.course.dto.SectionDto;
import com.smartlearn.course.repository.CourseRepository;
import com.smartlearn.events.CoursePublishedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(UUID id) {
        return courseRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public CourseResponse publishCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setStatus(CourseStatus.PUBLISHED);
        Course savedCourse = courseRepository.save(course);

        // Publish Event
        CoursePublishedEvent event = CoursePublishedEvent.builder()
                .eventId(UUID.randomUUID())
                .courseId(savedCourse.getId())
                .instructorId(savedCourse.getInstructorId())
                .title(savedCourse.getTitle())
                .occurredAt(Instant.now())
                .build();

        kafkaTemplate.send("course.published", savedCourse.getId().toString(), event);

        return mapToResponse(savedCourse);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .instructorId(course.getInstructorId())
                .status(course.getStatus().name())
                .sections(course.getSections().stream()
                        .map(section -> SectionDto.builder()
                                .id(section.getId())
                                .title(section.getTitle())
                                .orderIndex(section.getOrderIndex())
                                .lessons(section.getLessons().stream()
                                        .map(lesson -> LessonDto.builder()
                                                .id(lesson.getId())
                                                .title(lesson.getTitle())
                                                .videoUrl(lesson.getVideoUrl())
                                                .durationSeconds(lesson.getDurationSeconds())
                                                .orderIndex(lesson.getOrderIndex())
                                                .isPreview(lesson.isPreview())
                                                .build())
                                        .collect(Collectors.toList()))
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
