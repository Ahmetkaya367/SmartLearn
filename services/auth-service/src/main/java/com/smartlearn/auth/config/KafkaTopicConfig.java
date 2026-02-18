package com.smartlearn.auth.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic authLoginTopic() {
        return TopicBuilder.name("auth.login")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic userCreatedTopic() {
        return TopicBuilder.name("user.created")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
