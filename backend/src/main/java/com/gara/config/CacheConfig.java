package com.gara.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        // Cấu hình chung cho mọi vùng cache (Caffeine)
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(500)
                .expireAfterAccess(10, TimeUnit.MINUTES)
                .recordStats());
        // QUAN TRỌNG: Cho phép tạo Cache động khi gặp tên mới (như users_list) 
        // mà không cần khai báo trước trong application.yml
        cacheManager.setAllowNullValues(true);
        return cacheManager;
    }
}
