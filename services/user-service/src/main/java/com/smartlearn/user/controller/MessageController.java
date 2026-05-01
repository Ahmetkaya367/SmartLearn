package com.smartlearn.user.controller;

import com.smartlearn.user.domain.Message;
import com.smartlearn.user.repository.MessageRepository;
import com.smartlearn.user.client.EnrollmentClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
public class MessageController {
    private final MessageRepository messageRepository;
    private final EnrollmentClient enrollmentClient;
    private final com.smartlearn.user.repository.UserProfileRepository userProfileRepository;

    private String getUserName(UUID id) {
        return userProfileRepository.findById(id)
                .map(com.smartlearn.user.domain.UserProfile::getFullName)
                .orElse("Unknown Person");
    }

    // 1. GET /api/messages/conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @RequestHeader("X-User-Id") String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        List<Message> messages = messageRepository.findBySenderIdOrReceiverIdOrderBySentAtDesc(userId, userId);
        Map<UUID, Message> latest = new HashMap<>();
        for (Message m : messages) {
            UUID other = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
            if (!latest.containsKey(other)) latest.put(other, m);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : latest.entrySet()) {
            Map<String, Object> convo = new HashMap<>();
            convo.put("userId", entry.getKey());
            convo.put("name", getUserName(entry.getKey()));
            convo.put("lastMessage", entry.getValue());
            result.add(convo);
        }
        return ResponseEntity.ok(result);
    }

    // 2. GET /api/messages/thread/{otherUserId}
    @GetMapping("/thread/{otherUserId}")
    public ResponseEntity<List<Message>> getThread(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable UUID otherUserId) {
        UUID userId = UUID.fromString(userIdStr);
        List<Message> sent = messageRepository.findBySenderIdAndReceiverIdOrderBySentAtAsc(userId, otherUserId);
        List<Message> received = messageRepository.findBySenderIdAndReceiverIdOrderBySentAtAsc(otherUserId, userId);
        List<Message> all = new ArrayList<>();
        all.addAll(sent);
        all.addAll(received);
        all.sort(Comparator.comparing(Message::getSentAt));
        return ResponseEntity.ok(all);
    }

    // 3. POST /api/messages/send
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestBody Map<String, Object> payload) {
        UUID senderId = UUID.fromString(userIdStr);
        UUID receiverId = UUID.fromString((String) payload.get("receiverId"));
        String content = (String) payload.get("content");
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .sentAt(Instant.now())
                .read(false)
                .build();
        messageRepository.save(message);
        log.info("Message sent from {} to {}", senderId, receiverId);
        return ResponseEntity.ok(message);
    }

    // 4. GET /api/messages/eligible-contacts
    @GetMapping("/eligible-contacts")
    public ResponseEntity<List<Map<String, Object>>> getEligibleContacts(
            @RequestHeader("X-User-Id") String userIdStr,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        UUID userId = UUID.fromString(userIdStr);
        log.info("Getting eligible contacts for user {} with role {}", userId, role);

        List<Map<String, Object>> result = new ArrayList<>();
        Set<UUID> seen = new HashSet<>();

        if ("ROLE_INSTRUCTOR".equals(role)) {
            List<Map<String, Object>> students = enrollmentClient.getInstructorStudents(userId);
            for (Map<String, Object> s : students) {
                Object userIdObj = s.get("userId");
                if (userIdObj != null) {
                    UUID u = UUID.fromString(userIdObj.toString());
                    if (seen.add(u)) {
                        Map<String, Object> contact = new HashMap<>();
                        contact.put("id", u);
                        contact.put("name", s.get("studentName") != null ? s.get("studentName") : getUserName(u));
                        result.add(contact);
                    }
                }
            }
        } else if ("ROLE_STUDENT".equals(role)) {
            List<String> instructorIds = enrollmentClient.getStudentInstructors(userId);
            for (String id : instructorIds) {
                try { 
                    UUID uid = UUID.fromString(id);
                    if (seen.add(uid)) {
                        Map<String, Object> contact = new HashMap<>();
                        contact.put("id", uid);
                        contact.put("name", getUserName(uid));
                        result.add(contact);
                    }
                } catch (Exception ignored) {}
            }
        }
        return ResponseEntity.ok(result);
    }
}
