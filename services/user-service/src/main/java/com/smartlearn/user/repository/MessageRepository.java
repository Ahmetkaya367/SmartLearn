package com.smartlearn.user.repository;

import com.smartlearn.user.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findBySenderIdAndReceiverIdOrderBySentAtAsc(UUID senderId, UUID receiverId);
    List<Message> findByReceiverIdAndSenderIdOrderBySentAtAsc(UUID receiverId, UUID senderId);
    List<Message> findBySenderIdOrReceiverIdOrderBySentAtDesc(UUID senderId, UUID receiverId);
}
