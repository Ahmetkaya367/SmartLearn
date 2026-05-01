package com.smartlearn.course.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlearn.course.domain.Category;
import com.smartlearn.course.domain.Course;
import com.smartlearn.course.domain.CourseStatus;
import com.smartlearn.course.domain.Section;
import com.smartlearn.course.domain.Lesson;
import com.smartlearn.course.dto.CourseResponse;
import com.smartlearn.course.dto.CreateCourseRequest;
import com.smartlearn.course.dto.UpdateCourseRequest;
import com.smartlearn.course.dto.LessonDto;
import com.smartlearn.course.dto.SectionDto;
import com.smartlearn.course.repository.CategoryRepository;
import com.smartlearn.course.repository.CourseRepository;
import com.smartlearn.events.CoursePublishedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

        private final CourseRepository courseRepository;
        private final CategoryRepository categoryRepository;
        private final KafkaTemplate<String, Object> kafkaTemplate;
        private final ObjectMapper objectMapper;
        private final com.smartlearn.course.client.EnrollmentClient enrollmentClient;
        private final com.smartlearn.course.client.UserClient userClient;

	@Transactional(readOnly = true)
	public List<CourseResponse> getAllCourses() {
		return courseRepository.findAll().stream()
				.map(this::mapToResponse)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public CourseResponse getCourseById(UUID id) {
		return courseRepository.findById(id)
				.map(this::mapToResponse)
				.orElseThrow(() -> new RuntimeException("Course not found"));
	}

        @Transactional
        public CourseResponse publishCourse(UUID id) {
                Course course = courseRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                if (course.getStatus() == CourseStatus.PUBLISHED) {
                        log.info("Course {} is already PUBLISHED. Skipping redundant save and Kafka event.", id);
                        return mapToResponse(course);
                }

                log.info("Transitioning course {} to PUBLISHED status.", id);
                course.setStatus(CourseStatus.PUBLISHED);
                
                Course savedCourse;
                try {
                        savedCourse = courseRepository.save(course);
                        log.info("Course {} successfully saved as PUBLISHED in database.", id);
                } catch (Exception e) {
                        log.error("DATABASE ERROR: Failed to save course {} as PUBLISHED: {}", id, e.getMessage());
                        throw e; // We want to fail if the DB save fails
                }

                // Publish Event with Error Handling
                try {
                        log.debug("Creating CoursePublishedEvent for course: {}", savedCourse.getId());
                        CoursePublishedEvent event = CoursePublishedEvent.builder()
                                        .eventId(UUID.randomUUID())
                                        .courseId(savedCourse.getId())
                                        .instructorId(savedCourse.getInstructorId())
                                        .title(savedCourse.getTitle())
                                        .occurredAt(Instant.now())
                                        .build();

                        log.debug("Sending event to Kafka topic 'course.published'");
                        String jsonEvent = objectMapper.writeValueAsString(event);
                        kafkaTemplate.send("course.published", savedCourse.getId().toString(), jsonEvent);
                        log.info("Course published event sent to Kafka for course: {}", savedCourse.getId());
                } catch (Throwable t) {
                        log.error("NON-BLOCKING ERROR while sending CoursePublishedEvent for course {}: {}. Stacktrace: ", 
                                savedCourse.getId(), t.getMessage(), t);
                        log.info("Continuing workflow: course is already saved as PUBLISHED in the database.");
                }

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

	@Transactional(readOnly = true)
	public List<CourseResponse> getPublishedCourses() {
		return courseRepository.findAll().stream()
				.filter(course -> course.getStatus() == CourseStatus.PUBLISHED)
				.map(this::mapToResponse)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
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
                                                lesson.setDuration(lessonDto.getDurationSeconds());
                                                lesson.setType(lessonDto.getType() != null ? lessonDto.getType() : "video");
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

        @Transactional
        public void deleteCourse(UUID id, UUID instructorId) {
                Course course = courseRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                if (!course.getInstructorId().equals(instructorId)) {
                        throw new RuntimeException("You are not authorized to delete this course");
                }

                if (course.getStatus() != CourseStatus.DRAFT) {
                        throw new RuntimeException("Only draft courses can be deleted");
                }

                courseRepository.delete(course);
        }

        @Transactional
        public void renameCategory(String oldName, String newName) {
                log.info("Renaming category from '{}' to '{}'", oldName, newName);
                
                // 1. Kategoriler tablosunu güncelle
                categoryRepository.findByName(oldName).ifPresent(category -> {
                    category.setName(newName);
                    categoryRepository.save(category);
                });

                // 2. Kurslar tablosunu toplu güncelle (Bulk sync)
                int updatedCount = courseRepository.updateCategoryNames(oldName, newName);
                log.info("Successfully updated {} courses' category names.", updatedCount);
        }

        @Transactional
        public void addCategory(String name) {
            if (categoryRepository.findByName(name).isEmpty()) {
                Category category = Category.builder()
                        .name(name)
                        .build();
                categoryRepository.save(category);
                log.info("New category added: {}", name);
            }
        }

        @Transactional
        public void deleteCategory(String name) {
            long courseCount = courseRepository.countByCategory(name);
            if (courseCount > 0) {
                throw new RuntimeException("Bu kategoriye ait " + courseCount + " adet kurs bulunmaktadır. Önce kursları başka bir kategoriye taşıyın veya silin.");
            }

            categoryRepository.findByName(name).ifPresent(category -> {
                categoryRepository.delete(category);
                log.info("Category removed from master list: {}", name);
            });
        }

    private CourseResponse mapToResponse(Course course) {
        long realStudentCount = course.getStudentCount();
        try {
            Long count = enrollmentClient.getCourseEnrollmentCount(course.getId());
            if (count != null) {
                realStudentCount = count;
                // Sync back to DB optionally, but here we just use it for response
            }
        } catch (Exception e) {
            log.warn("Failed to fetch enrollment count for course {}: {}", course.getId(), e.getMessage());
        }

        // Calculate total course duration dynamically
        int totalDurationSeconds = 0;
        if (course.getSections() != null) {
            for (var section : course.getSections()) {
                if (section.getLessons() != null) {
                    for (var lesson : section.getLessons()) {
                        if (lesson.getDuration() != null) {
                            totalDurationSeconds += lesson.getDuration();
                        }
                    }
                }
            }
        }
        
        String formattedCourseDuration = "";
        if (totalDurationSeconds > 0) {
            int hours = totalDurationSeconds / 3600;
            int minutes = (totalDurationSeconds % 3600) / 60;
            if (hours > 0) {
                formattedCourseDuration = hours + "s " + minutes + "dk";
            } else {
                formattedCourseDuration = minutes + "dk";
            }
        } else {
            formattedCourseDuration = course.getDuration(); // Fallback to string if available
        }

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .originalPrice(course.getOriginalPrice())
                .instructorId(course.getInstructorId())
                .instructor(fetchInstructorName(course.getInstructorId()))
                .instructorBio(fetchInstructorBio(course.getInstructorId(), course.getInstructorBio()))
                .instructorImage(fetchInstructorAvatar(course.getInstructorId(), course.getInstructorImage()))
                .instructorTitle(course.getInstructorTitle())
                .category(course.getCategory())
                .level(course.getLevel())
                .studentCount((int) realStudentCount)
                .rating(course.getRating())
                .reviewCount(course.getReviewCount())
                .duration(formattedCourseDuration)
                .totalDurationSeconds(totalDurationSeconds)
                .isBestseller(course.isBestseller())
                .updatedAt(course.getUpdatedAt() != null ? course.getUpdatedAt().toString() : null)
                .thumbnail(course.getThumbnailUrl())
                .videoPreviewUrl(course.getVideoPreviewUrl())
                .longDescription(course.getLongDescription())
                .learningOutcomes(course.getLearningOutcomes())
                .requirements(course.getRequirements())
                .targetAudience(course.getTargetAudience())
                // instructorBio, instructorImage handled above
                .instructorTitle(course.getInstructorTitle())
                .instructorStudents(course.getInstructorStudents())
                .instructorCourses(course.getInstructorCourses())
                .instructorRating(course.getInstructorRating())
                .language(course.getLanguage())
                .lastUpdated(course.getLastUpdated())
                .certificateIncluded(course.isCertificateIncluded())
                .status(course.getStatus() != null ? course.getStatus().name() : null)
                .sections(course.getSections() == null ? List.of() : course.getSections().stream()
                        .map(section -> SectionDto.builder()
                                .id(section.getId())
                                .title(section.getTitle())
                                .orderIndex(section.getOrderIndex())
                                .lessons(section.getLessons() == null ? List.of() : section.getLessons().stream()
                                        .map(lesson -> {
                                            String formattedLessonDuration = "";
                                            if (lesson.getDuration() != null) {
                                                int min = lesson.getDuration() / 60;
                                                int sec = lesson.getDuration() % 60;
                                                formattedLessonDuration = String.format("%d:%02d", min, sec);
                                            }
                                            return LessonDto.builder()
                                                .id(lesson.getId())
                                                .title(lesson.getTitle())
                                                .videoUrl(lesson.getVideoUrl())
                                                .duration(formattedLessonDuration)
                                                .durationSeconds(lesson.getDuration() != null ? lesson.getDuration() : 0)
                                                .type(lesson.getType())
                                                .orderIndex(lesson.getOrderIndex())
                                                .isPreview(lesson.isPreview())
                                                .build();
                                        })
                                        .collect(Collectors.toList()))
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public void incrementStudentCount(UUID id) {
        courseRepository.findById(id).ifPresent(course -> {
            course.setStudentCount(course.getStudentCount() + 1);
            courseRepository.save(course);
        });
    }

    private String fetchInstructorName(UUID instructorId) {
        if (instructorId == null) return "Sarah Johnson";
        try {
            java.util.Map<String, Object> profile = userClient.getUserProfile(instructorId);
            return profile != null ? (String) profile.getOrDefault("fullName", "Sarah Johnson") : "Sarah Johnson";
        } catch (Exception e) {
            log.warn("Failed to fetch instructor name for {}: {}", instructorId, e.getMessage());
            return "Sarah Johnson";
        }
    }

    private String fetchInstructorBio(UUID instructorId, String fallback) {
        if (instructorId == null) return fallback;
        try {
            java.util.Map<String, Object> profile = userClient.getUserProfile(instructorId);
            return profile != null ? (String) profile.getOrDefault("bio", fallback) : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }

    private String fetchInstructorAvatar(UUID instructorId, String fallback) {
        if (instructorId == null) return fallback;
        try {
            java.util.Map<String, Object> profile = userClient.getUserProfile(instructorId);
            return profile != null ? (String) profile.getOrDefault("avatarUrl", fallback) : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }
}
