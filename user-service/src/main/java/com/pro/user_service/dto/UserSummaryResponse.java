package com.pro.user_service.dto;

import lombok.Data;

@Data
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String fullName;
    private String name;
    private String email;
    private String bio;

    public UserSummaryResponse(Long id, String username, String fullName, String name, String email, String bio) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.name = name;
        this.email = email;
        this.bio = bio;
    }

    public UserSummaryResponse(Long id, String name, String email, String bio) {
        this.id = id;
        this.name = name;
        this.fullName = name;
        this.email = email;
        this.bio = bio;
    }
}
