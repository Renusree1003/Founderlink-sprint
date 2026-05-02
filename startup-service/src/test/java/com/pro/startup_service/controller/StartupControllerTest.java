package com.pro.startup_service.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.pro.startup_service.entity.Startup;
import com.pro.startup_service.service.StartupService;

@ExtendWith(MockitoExtension.class)
class StartupControllerTest {

    @Mock
    private StartupService service;

    @InjectMocks
    private StartupController controller;

    @Test
    void testCreate() {
        Startup startup = new Startup();
        startup.setTitle("Test");
        
        when(service.create(any(Startup.class))).thenReturn(startup);
        
        Startup result = controller.create(startup);
        assertNotNull(result);
        assertEquals("Test", result.getTitle());
        verify(service, times(1)).create(startup);
    }

    @Test
    void testGetAll() {
        Startup startup = new Startup();
        Page<Startup> page = new PageImpl<>(Arrays.asList(startup));
        
        when(service.getAll(any(), any(), any(Pageable.class))).thenReturn(page);
        
        ResponseEntity<Page<Startup>> response = controller.getAll(null, null, 0, 10, "id", "DESC");
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getContent().size());
        verify(service, times(1)).getAll(any(), any(), any(Pageable.class));
    }

    @Test
    void testGetById() {
        Startup startup = new Startup();
        startup.setId(1L);
        when(service.getById(1L)).thenReturn(startup);
        
        Startup result = controller.getById(1L);
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(service, times(1)).getById(1L);
    }

    @Test
    void testUpdate() {
        Startup startup = new Startup();
        startup.setId(1L);
        startup.setTitle("Updated");
        
        when(service.update(eq(1L), any(Startup.class))).thenReturn(startup);
        
        Startup result = controller.update(1L, startup);
        assertNotNull(result);
        assertEquals("Updated", result.getTitle());
        verify(service, times(1)).update(1L, startup);
    }

    @Test
    void testDelete() {
        controller.delete(1L);
        verify(service, times(1)).delete(1L);
    }
}
