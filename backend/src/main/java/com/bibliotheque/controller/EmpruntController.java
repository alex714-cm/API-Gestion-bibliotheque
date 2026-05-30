package com.bibliotheque.controller;

import com.bibliotheque.dto.EmpruntRequestDTO;
import com.bibliotheque.dto.EmpruntResponseDTO;
import com.bibliotheque.service.EmpruntService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/emprunts")
@CrossOrigin("*")
public class EmpruntController {

    @Autowired
    private EmpruntService empruntService;

    @PostMapping
    public ResponseEntity<?> borrowBook(@Valid @RequestBody EmpruntRequestDTO dto) {
        try {
            EmpruntResponseDTO response = empruntService.emprunter(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/retour")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            EmpruntResponseDTO response = empruntService.retourner(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<?> annulerEmprunt(@PathVariable Long id) {
        try {
            EmpruntResponseDTO response = empruntService.annuler(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/date-retour")
    public ResponseEntity<?> modifierDateRetourPrevue(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            LocalDate nouvelleDate = LocalDate.parse(body.get("dateRetourPrevue"));
            EmpruntResponseDTO response = empruntService.modifierDateRetourPrevue(id, nouvelleDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<EmpruntResponseDTO>> getAllLoans() {
        return ResponseEntity.ok(empruntService.getAllEmprunts());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EmpruntResponseDTO>> getUserLoans(@PathVariable Long userId) {
        return ResponseEntity.ok(empruntService.getEmpruntsByUser(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(empruntService.getDashboardStats());
    }
}
