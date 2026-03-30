package com.gara.dto;

import java.util.List;

public record LoginResponse(
                String token,
                Integer userId,
                String username,
                String fullName,
                String avatar,
                String email,
                String phone,
                java.time.LocalDateTime createdAt,
                List<String> roles,
                List<String> permissions) {

        public static LoginResponseBuilder builder() {
                return new LoginResponseBuilder();
        }

        public static class LoginResponseBuilder {
                private String token;
                private Integer userId;
                private String username;
                private String fullName;
                private String avatar;
                private String email;
                private String phone;
                private java.time.LocalDateTime createdAt;
                private List<String> roles;
                private List<String> permissions;

                public LoginResponseBuilder token(String token) {
                        this.token = token;
                        return this;
                }

                public LoginResponseBuilder userId(Integer userId) {
                        this.userId = userId;
                        return this;
                }

                public LoginResponseBuilder username(String username) {
                        this.username = username;
                        return this;
                }

                public LoginResponseBuilder fullName(String fullName) {
                        this.fullName = fullName;
                        return this;
                }

                public LoginResponseBuilder avatar(String avatar) {
                        this.avatar = avatar;
                        return this;
                }

                public LoginResponseBuilder email(String email) {
                        this.email = email;
                        return this;
                }

                public LoginResponseBuilder phone(String phone) {
                        this.phone = phone;
                        return this;
                }

                public LoginResponseBuilder createdAt(java.time.LocalDateTime createdAt) {
                        this.createdAt = createdAt;
                        return this;
                }

                public LoginResponseBuilder roles(List<String> roles) {
                        this.roles = roles;
                        return this;
                }

                public LoginResponseBuilder permissions(List<String> permissions) {
                        this.permissions = permissions;
                        return this;
                }

                public LoginResponse build() {
                        return new LoginResponse(token, userId, username, fullName, avatar, email, phone, createdAt, roles, permissions);
                }
        }
}
