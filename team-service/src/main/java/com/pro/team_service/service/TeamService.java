package com.pro.team_service.service;

import java.util.List;

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

    // Get team by startup
    public List<Team> getByStartup(Long startupId) {
        return repository.findByStartupId(startupId);
    }
}