package com.gara.modules.support.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

/**
 * Service to keep the Render backend instance alive on the free tier.
 * Render spins down free instances after period of inactivity.
 * This service pings the health check endpoint every 5 minutes.
 */
@Service
public class RenderKeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(RenderKeepAliveService.class);

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    /**
     * Pings the health endpoint every 3 minutes (180,000 milliseconds).
     */
    @Scheduled(fixedRate = 180000)
    public void keepAlive() {
        if (renderExternalUrl == null || renderExternalUrl.isEmpty()) {
            // Not running on Render or URL not configured, skip
            return;
        }

        String healthUrl = renderExternalUrl.endsWith("/") 
                ? renderExternalUrl + "api/status/health" 
                : renderExternalUrl + "/api/status/health";

        try {
            URL url = URI.create(healthUrl).toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                log.debug("Auto-ping successful: {} - Status: {}", healthUrl, responseCode);
            } else {
                log.warn("Auto-ping returned non-OK status: {} - Status: {}", healthUrl, responseCode);
            }
            connection.disconnect();
        } catch (Exception e) {
            log.error("Failed to perform auto-ping to {}: {}", healthUrl, e.getMessage());
        }
    }
}
