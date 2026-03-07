package com.gara;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$X/yD87u.2pXYV2B82y1kF.y.mE6R.cZ/vA7V1S6A2I0pY6sZ/a7C2";
        boolean matches = encoder.matches("123456", hash);
        System.out.println("Password '123456' matches current hash: " + matches);
        System.out.println("Correct hash for '123456' is: " + encoder.encode("123456"));
    }
}
