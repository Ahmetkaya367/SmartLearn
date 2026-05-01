package com.smartlearn.course.service;

import com.smartlearn.course.domain.Course;
import com.smartlearn.course.domain.CourseStatus;
import com.smartlearn.course.domain.Section;
import com.smartlearn.course.domain.Lesson;
import com.smartlearn.course.dto.CourseResponse;
import com.smartlearn.course.dto.CreateCourseRequest;
import com.smartlearn.course.dto.UpdateCourseRequest;
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

        @Transactional
        public CourseResponse rejectCourse(UUID id) {
                Course course = courseRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                course.setStatus(CourseStatus.ARCHIVED); // Treat ARCHIVED as rejected
                Course savedCourse = courseRepository.save(course);
                return mapToResponse(savedCourse);
        }

        public List<CourseResponse> getPublishedCourses() {
                return courseRepository.findAll().stream()
                                .filter(course -> course.getStatus() == CourseStatus.PUBLISHED)
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<CourseResponse> getInstructorCourses(UUID instructorId) {
                return courseRepository.findAllByInstructorId(instructorId).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public CourseResponse createCourse(CreateCourseRequest request, UUID instructorId) {
                Course course = Course.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .price(request.getPrice())
                                .instructorId(instructorId)
                                .category(request.getCategory())
                                .level(request.getLevel())
                                .thumbnailUrl(request.getThumbnail())
                                .status(CourseStatus.DRAFT)
                                .build();
                return mapToResponse(courseRepository.save(course));
        }

        @Transactional
        public CourseResponse updateCourse(UUID id, UpdateCourseRequest request, UUID instructorId) {
                Course course = courseRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                if (!course.getInstructorId().equals(instructorId)) {
                        throw new RuntimeException("You are not authorized to update this course");
                }

                if (request.getTitle() != null) course.setTitle(request.getTitle());
                if (request.getDescription() != null) course.setDescription(request.getDescription());
                if (request.getPrice() != null) course.setPrice(request.getPrice());
                if (request.getCategory() != null) course.setCategory(request.getCategory());
                if (request.getLevel() != null) course.setLevel(request.getLevel());
                if (request.getThumbnail() != null) course.setThumbnailUrl(request.getThumbnail());
                if (request.getVideoPreviewUrl() != null) course.setVideoPreviewUrl(request.getVideoPreviewUrl());
                if (request.getLongDescription() != null) course.setLongDescription(request.getLongDescription());

                // Update curriculum
                if (request.getSections() != null) {
                        course.getSections().clear();
                        for (SectionDto sectionDto : request.getSections()) {
                                Section section = new Section();
                                section.setTitle(sectionDto.getTitle());
                                section.setOrderIndex(sectionDto.getOrderIndex());
                                
                                if (sectionDto.getLessons() != null) {
                                        for (LessonDto lessonDto : sectionDto.getLessons()) {
                                                Lesson lesson = new Lesson();
                                                lesson.setTitle(lessonDto.getTitle());
                                                lesson.setVideoUrl(lessonDto.getVideoUrl());
                                                lesson.setDurationSeconds(lessonDto.getDurationSeconds());
                                                lesson.setOrderIndex(lessonDto.getOrderIndex());
                                                lesson.setPreview(lessonDto.isPreview());
                                                section.addLesson(lesson);
                                        }
                                }
                                course.addSection(section);
                        }
                }

                return mapToResponse(courseRepository.save(course));
        }

        private CourseResponse mapToResponse(Course course) {
                return CourseResponse.builder()
                                .id(course.getId())
                                .title(course.getTitle())
                                .description(course.getDescription())
                                .price(course.getPrice())
                                .instructorId(course.getInstructorId())
                                .instructor("Sarah Johnson") // TODO: Get from user-service
                                .category(course.getCategory())
                                .level(course.getLevel())
                                .studentCount(course.getStudentCount())
                                .rating(course.getRating())
                                .reviewCount(course.getReviewCount())
                                .duration(course.getDuration())
                                .isBestseller(course.isBestseller())
                                .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null)
                                .thumbnail(course.getThumbnailUrl())
                                .videoPreviewUrl(course.getVideoPreviewUrl())
                                .longDescription(course.getLongDescription())
                                .learningOutcomes(course.getLearningOutcomes())
                                .requirements(course.getRequirements())
                                .targetAudience(course.getTargetAudience())
                                .instructorBio(course.getInstructorBio())
                                .instructorImage(course.getInstructorImage())
                                .instructorTitle(course.getInstructorTitle())
                                .instructorStudents(course.getInstructorStudents())
                                .instructorCourses(course.getInstructorCourses())
                                .instructorRating(course.getInstructorRating())
                                .language(course.getLanguage())
                                .lastUpdated(course.getLastUpdated())
                                .certificateIncluded(course.isCertificateIncluded())
                                .status(course.getStatus())
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
                                                                                                .duration("10:00") // Mock
                                                                                                                   // for
                                                                                                                   // now
                                                                                                .durationSeconds(lesson
                                                                                                                .getDurationSeconds())
                                                                                                .type("video") // Mock
                                                                                                               // for
                                                                                                               // now
                                                                                                .orderIndex(lesson
                                                                                                                .getOrderIndex())
                                                                                                .isPreview(lesson
                                                                                                                .isPreview())
                                                                                                .build())
                                                                                .collect(Collectors.toList()))
                                                                .build())
                                                .collect(Collectors.toList()))
                                .build();
        }
}
