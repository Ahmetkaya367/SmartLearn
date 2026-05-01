package com.smartlearn.gateway.security;

import lombok.Data;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtUtils jwtUtils;

    public AuthenticationFilter(JwtUtils jwtUtils) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().toString();
            String method = request.getMethod().name();

            // Skip authentication for public endpoints
            // GET /api/courses and GET /api/courses/{id} are public
            // BUT GET /api/courses/all is NOT public
            boolean isPublicCoursePath = path.startsWith("/api/courses") 
                && !path.equals("/api/courses/all") 
                && !path.startsWith("/api/courses/instructor")
                && !path.startsWith("/api/courses/me")
                && method.equals("GET");

            if (isPublicCoursePath) {
                return chain.filter(exchange);
            }

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            if (!jwtUtils.validateToken(token)) {
                return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
            }

            try {
                String userId = jwtUtils.extractUserId(token);
                String role = jwtUtils.extractRole(token);
                
                if (userId == null) {
                    System.err.println("WARNING: UserId missing in valid token. This might be an old token format.");
                }

                // Populate User Info to Headers for downstream services
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId != null ? userId : "")
                        .header("X-User-Role", role != null ? role : "")
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } catch (Exception e) {
                System.err.println("CRITICAL ERROR in AuthenticationFilter: " + e.getMessage());
                return onError(exchange, "Authentication Processing Error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    @Data
    public static class Config {
        // Configuration properties for the filter if needed
    }
}
