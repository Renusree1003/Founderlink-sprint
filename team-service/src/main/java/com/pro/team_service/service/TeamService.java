package com.pro.team_service.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.pro.team_service.client.UserServiceClient;
import com.pro.team_service.dto.NotificationEvent;
import com.pro.team_service.dto.TeamRequest;
import com.pro.team_service.dto.UserSummaryResponse;
import com.pro.team_service.entity.Team;
import com.pro.team_service.producer.NotificationProducer;
import com.pro.team_service.repository.TeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository repository;
    private final UserServiceClient userServiceClient;
    private final NotificationProducer notificationProducer;

    // Invite Cofounder
    public Team invite(TeamRequest request) {
        Team team = new Team();
        team.setStartupId(request.getStartupId());
        team.setUserId(request.getUserId());
        team.setRole("INVITED");

        Team savedTeam = repository.save(team);
        notifyMember(savedTeam, "You have been invited to join startup " + savedTeam.getStartupId() + ".");
        return savedTeam;
    }

    // Join Team
    public Team join(TeamRequest request) {
        Team team = new Team();
        team.setStartupId(request.getStartupId());
        team.setUserId(request.getUserId());
        team.setRole("MEMBER");

        Team savedTeam = repository.save(team);
        notifyMember(savedTeam, "You have been added as a team member to startup " + savedTeam.getStartupId() + ".");
        return savedTeam;
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

    private void notifyMember(Team team, String message) {
        if (team.getUserId() == null) {
            return;
        }
        UserSummaryResponse user = userServiceClient.getUserById(team.getUserId());
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        notificationProducer.sendNotification(new NotificationEvent(user.getEmail(), message));
    }
}
