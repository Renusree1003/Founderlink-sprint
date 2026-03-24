package com.pro.team_service.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.pro.team_service.dto.TeamRequest;
import com.pro.team_service.entity.Team;
import com.pro.team_service.repository.TeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository repository;

    // Invite Cofounder
    public Team invite(TeamRequest request) {
        Team team = new Team();
        team.setStartupId(request.getStartupId());
        team.setUserId(request.getUserId());
        team.setRole("INVITED");

        return repository.save(team);
    }

    // Join Team
    public Team join(TeamRequest request) {
        Team team = new Team();
        team.setStartupId(request.getStartupId());
        team.setUserId(request.getUserId());
        team.setRole("MEMBER");

        return repository.save(team);
    }

    // ✅ ADD THIS BACK
    public List<Team> getByStartup(Long startupId) {
        return repository.findByStartupId(startupId);
    }

    // Get teams of logged-in user
    public List<Team> getMyTeams() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.parseLong(auth.getName());
        return repository.findByUserId(userId);
    }
}