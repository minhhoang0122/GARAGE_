package com.gara.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "SystemConfig")
public class SystemConfig {
    @Id
    @Column(name = "ConfigKey", length = 50)
    private String configKey;

    @Column(name = "ConfigValue", length = 255)
    private String configValue;

    @Column(name = "Description", length = 255)
    private String description;

    public SystemConfig() {
    }

    public SystemConfig(String configKey, String configValue, String description) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.description = description;
    }

    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
