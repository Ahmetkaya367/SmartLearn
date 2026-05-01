package com.smartlearn.user.controller;

import com.smartlearn.user.domain.SystemSetting;
import com.smartlearn.user.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/site-settings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsController {

    private final SystemSettingRepository systemSettingRepository;

    @GetMapping
    public ResponseEntity<Map<String, String>> getSettings() {
        log.info("Fetching site settings...");
        Map<String, String> settings = systemSettingRepository.findAll().stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
        return ResponseEntity.ok(settings);
    }

    @PostMapping
    public ResponseEntity<Void> updateSetting(@RequestBody Map<String, String> settings) {
        log.info("Updating site settings: {}", settings);
        settings.forEach((key, value) -> {
            SystemSetting setting = systemSettingRepository.findById(key)
                    .orElse(SystemSetting.builder().key(key).build());
            setting.setValue(value);
            systemSettingRepository.save(setting);
        });
        return ResponseEntity.ok().build();
    }
}
