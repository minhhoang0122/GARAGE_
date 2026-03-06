package com.gara.dto;

public record LoginResponse(
                String token,
                Integer userId,
                String username,
                String fullName,
                String role) {

        public static LoginResponseBuilder builder() {
                return new LoginResponseBuilder();
        }

        public static class LoginResponseBuilder {
                private String token;
                private Integer userId;
                private String username;
                private String fullName;
                private String role;

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

                public LoginResponseBuilder role(String role) {
                        this.role = role;
                        return this;
                }

                public LoginResponse build() {
                        return new LoginResponse(token, userId, username, fullName, role);
                }
        }
}
