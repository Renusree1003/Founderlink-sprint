package com.pro.team_service.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pro.team_service.dto.TeamRequest;
import com.pro.team_service.entity.Team;
import com.pro.team_service.service.TeamService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService service;

    // INVITE
    @PostMapping("/invite")
    @PreAuthorize("hasAnyRole('FOUNDER','ADMIN')")
    public Team invite(@RequestBody TeamRequest req) {
        return service.invite(req);
    }

    // JOIN
    @PostMapping("/join")
    @PreAuthorize("hasAnyRole('COFOUNDER','ADMIN')")
    public Team join(@RequestBody TeamRequest req) {
        return service.join(req);
    }

    // GET TEAM
    @GetMapping("/startup/{id}")
    @PreAuthorize("hasAnyRole('FOUNDER','COFOUNDER','ADMIN')")
    public List<Team> getTeam(@PathVariable Long id) {
        return service.getByStartup(id);
    }
}