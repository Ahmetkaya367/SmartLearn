package com.smartlearn.assistant.service;

import com.smartlearn.assistant.client.CourseClient;
import com.smartlearn.assistant.client.EnrollmentClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssistantService {

    private static final Logger log = LoggerFactory.getLogger(AssistantService.class);

    private final CourseClient courseClient;
    private final EnrollmentClient enrollmentClient;
    private final RestTemplate restTemplate;

    @Value("${spring.ai.google.genai.api-key:}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent";

    public AssistantService(CourseClient courseClient, EnrollmentClient enrollmentClient) {
        this.courseClient = courseClient;
        this.enrollmentClient = enrollmentClient;
        this.restTemplate = new RestTemplate();
    }

    public String getRecommendations(String userIdStr) {
        // İlk istekte bu mesaj gider, aşağıdaki 'chat' metodunda yakalanır.
        return chat("Merhaba, bana özel kurs önerileri sunar mısın?", userIdStr);
    }

    public String chat(String userMessage, String userIdStr) {
        log.info("Chat requested with message: {}", userMessage);

        // 1. KONTROL: GİRİŞ VE KURS DURUMU (API'YE GİTMEDEN ÖNCE)
        boolean isGuest = (userIdStr == null || userIdStr.isBlank() || userIdStr.equals("guest"));
        List<Map<String, Object>> userEnrollments = new ArrayList<>();
        
        if (!isGuest) {
            log.info("Kullanıcı tanındı, ID: {}", userIdStr);
            try {
                userEnrollments = enrollmentClient.getUserProgress(UUID.fromString(userIdStr));
                log.info("Kullanıcının kurs sayısı: {}", userEnrollments.size());
            } catch (Exception e) {
                log.error("Kullanıcı kurs verileri alınırken hata: {}", e.getMessage());
            }
        } else {
            log.info("Kullanıcı misafir (guest) olarak algılandı.");
        }

        // Eğer kullanıcı yeni gelmişse (varsayılan mesaj) ve kursu yoksa/giriş yapmamışsa direkt cevap ver
        boolean isFirstGreeting = userMessage.equals("Merhaba, bana özel kurs önerileri sunar mısın?");
        
        if ((isGuest || userEnrollments.isEmpty()) && isFirstGreeting) {
            return "Merhaba! Şu an henüz bir kursun yok ya da giriş yapmadın. Senin için en iyi yolu çizebilmemiz için ilgi alanlarını, amacını veya bir kurstan ne beklediğini yazabilirsin. Böylece öğrenimini SmartLearn ile sıradaki aşamaya geçirebiliriz!";
        }

        // 2. API ANAHTARI KONTROLÜ
        if (apiKey == null || apiKey.isBlank() || apiKey.length() < 10) {
            return "Gemini API anahtarı geçersiz veya eksik. Lütfen yapılandırmanızı kontrol edin.";
        }

        try {
            // Mevcut tüm kursları çek
            List<Map<String, Object>> allCourses = courseClient.getAllCourses();
            
            // HIZ OPTİMİZASYONU: Map oluşturarak kurslara hızlı erişim sağla
            Map<String, String> courseIdToTitle = allCourses.stream()
                .collect(Collectors.toMap(c -> c.get("id").toString(), c -> c.get("title").toString(), (v1, v2) -> v1));

            // Kullanıcın zaten sahip olduğu kurslar (Context için lazım)
            String enrolledTitles = userEnrollments.stream()
                    .map(e -> courseIdToTitle.getOrDefault(e.get("courseId").toString(), "Bilinmeyen Kurs"))
                    .collect(Collectors.joining(", "));

            // Önerilecek liste (Zaten sahip olduklarını çıkarıyoruz)
            Set<String> enrolledIds = userEnrollments.stream()
                    .map(e -> e.get("courseId").toString())
                    .collect(Collectors.toSet());

            String coursesInfo = allCourses.stream()
                    .filter(c -> !enrolledIds.contains(c.get("id").toString()))
                    .map(c -> String.format("- [%s](/courses/%s) (Kategori: %s, Açıklama: %s)", 
                        c.get("title"), c.get("id"), c.get("category"), c.get("description")))
                    .collect(Collectors.joining("\n"));

            StringBuilder systemPrompt = new StringBuilder();
            systemPrompt.append("Sen SmartLearn için çalışan uzman bir eğitim danışmanısın. SADECE aşağıdaki listede linki verilen kursları önerebilirsin.\n\n");
            
            if (isGuest) {
                systemPrompt.append("KRİTİK DURUM: Bu kullanıcı şu an MİSAFİR (Guest). Henüz hiçbir kursu yok.\n");
                systemPrompt.append("ASLA geçmiş bir bilgisinden veya mevcut kursundan bahsetme. Sanki ilk kez tanışıyormuşsun gibi davran.\n\n");
            } else {
                systemPrompt.append("KULLANICININ ZATEN SAHİP OLDUĞU KURSLAR: ").append(enrolledTitles).append("\n\n");
            }

            systemPrompt.append("ÖNEREBİLECEĞİN YENİ KURSLAR (GERÇEK LİSTE):\n").append(coursesInfo).append("\n\n");

            if (isFirstGreeting) {
                if (isGuest) {
                    systemPrompt.append("GÖREV: Kullanıcıyı samimi karşıla ve eldeki en popüler kurslardan birini öner.\n");
                } else {
                    systemPrompt.append("GÖREV: Karşılamada kullanıcının şu anki kurslarını (").append(enrolledTitles).append(") bildiğini belirt ve yeni bir kurs öner.\n");
                }
            } else {
                systemPrompt.append("GÖREV: Selam vermeden direkt soruyu cevapla ve yeni bir kurs öner.\n");
            }

            systemPrompt.append("\nCEVAP FORMATI (BU YAPIYA KESİN UY):\n");
            systemPrompt.append("Sizin için önereceğim kurs: [Kurs Adı](/courses/ID)\n\n");
            systemPrompt.append("Neden bu kurs?: 1-2 cümlelik analiz.\n\n");
            
            if (!isGuest) {
                systemPrompt.append("Kariyerine Katkısı: Bu yeni kursun, kullanıcının MEVCUT kurslarıyla (").append(enrolledTitles).append(") nasıl bir sinerji oluşturacağını açıkla.\n");
            } else {
                systemPrompt.append("Kariyerine Katkısı: Bu kursun genel olarak kariyerine ne katacağını açıkla.\n");
            }

            systemPrompt.append("\n!!! ÇOK KRİTİK KURALLAR !!!\n");
            systemPrompt.append("1. ASLA ** veya başka markdown sembolü kullanma.\n");
            systemPrompt.append("2. Başlıkları aynen yukarıdaki gibi (Neden bu kurs?: vb.) yaz.\n");
            systemPrompt.append("3. SADECE [Kurs Adı](/courses/ID) formatını kullan.\n");

            systemPrompt.append("\nKullanıcı Mesajı: ").append(userMessage);

            return callGemini(systemPrompt.toString());

        } catch (Exception e) {
            log.error("Chat error: ", e);
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                return getFallbackResponse(userMessage);
            }
            return "Üzgünüm, şu an teknik bir sorun yaşıyorum. Lütfen biraz sonra tekrar dener misin?";
        }
    }

    private String callGemini(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-goog-api-key", apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", Collections.singletonList(part));
            requestBody.put("contents", Collections.singletonList(content));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL, entity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) firstCandidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Asistan şu an cevap veremiyor.";
        } catch (Exception e) {
            log.error("Gemini API call failed: ", e);
            if (e.getMessage() != null && e.getMessage().contains("429")) {
                // Burada kullanıcı mesajına erişemiyoruz, genel mesaj verelim
                return "Şu an API kotam dolmuş durumda. Lütfen yaklaşık 30 saniye sonra tekrar dener misin? Bu sırada platformdaki popüler kurslarımıza göz atabilirsin! 😊";
            }
            return "Gemini API hatası: " + e.getMessage();
        }
    }

    private String getFallbackResponse(String userMessage) {
        if (userMessage.toLowerCase().contains("kurs") || userMessage.toLowerCase().contains("öneri")) {
            return "Şu an API kotam dolmuş olsa da sana genel bir tavsiye verebilirim: SmartLearn üzerindeki 'Modern Web Geliştirme' ve 'Veri Bilimi Giriş' kursları şu an çok popüler! Kota sıfırlandığında senin için daha özel bir analiz yapabilirim! 😊";
        }
        return "Şu an çok yoğunum (API kotam doldu), ama öğrenme azmine hayranım! Lütfen biraz sonra tekrar sormayı dene, sana yardımcı olmayı çok istiyorum. ✨";
    }
}