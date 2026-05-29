package com.bibliotheque.controller;

import com.bibliotheque.dto.AuteurRequestDTO;
import com.bibliotheque.dto.AuteurResponseDTO;
import com.bibliotheque.entities.Auteur;
import com.bibliotheque.exception.ResourceNotFoundException;
import com.bibliotheque.mapper.AuteurMapper;
import com.bibliotheque.repositories.AuteurRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller pour la ressource Auteur.
 *
 * Endpoints exposés :
 *   GET    /api/auteurs                     → liste tous les auteurs
 *   GET    /api/auteurs/{id}                → détail d'un auteur
 *   GET    /api/auteurs/search?nom=ER       → recherche par préfixe de nom
 *   GET    /api/auteurs/livre/{titre}       → auteur d'un livre
 *   POST   /api/auteurs                     → créer un auteur
 *   PUT    /api/auteurs/{id}               → mettre à jour un auteur
 *   DELETE /api/auteurs/{id}               → supprimer un auteur
 */
@RestController
@RequestMapping("/api/auteurs")
@CrossOrigin("*")
public class AuteurController {

    // Injection par constructeur (bonne pratique — facilite les tests)
    private final AuteurRepository auteurRepository;
    private final AuteurMapper     auteurMapper;

    public AuteurController(AuteurRepository auteurRepository,
                            AuteurMapper auteurMapper) {
        this.auteurRepository = auteurRepository;
        this.auteurMapper     = auteurMapper;
    }

    // ── GET /api/auteurs ──────────────────────────────────────────────────
    // Retourne la liste complète de tous les auteurs
    @GetMapping
    public ResponseEntity<List<AuteurResponseDTO>> getAll() {
        List<AuteurResponseDTO> dtos = auteurRepository.findAll()
                .stream()
                .map(auteurMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
        // HTTP 200 OK + [ { "id":1, "nom":"...", "livres":[] }, ... ]
    }

    // ── GET /api/auteurs/{id} ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<AuteurResponseDTO> getById(@PathVariable Long id) {
        Auteur auteur = auteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auteur", id));
        // → GlobalExceptionHandler → 404 Not Found si absent
        return ResponseEntity.ok(auteurMapper.toDTO(auteur));
    }

    // ── GET /api/auteurs/search?nom=ER ────────────────────────────────────
    // Utilise la méthode dérivée existante du repository
    @GetMapping("/search")
    public ResponseEntity<List<AuteurResponseDTO>> searchByNom(
            @RequestParam String nom) {

        List<AuteurResponseDTO> dtos = auteurRepository
                .findByNomStartingWith(nom)          // méthode du repository existant
                .stream()
                .map(auteurMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ── GET /api/auteurs/livre/{titre} ────────────────────────────────────
    // Utilise la @Query JPQL existante du repository
    @GetMapping("/livre/{titre}")
    public ResponseEntity<AuteurResponseDTO> getByTitreLivre(
            @PathVariable String titre) {

        Auteur auteur = auteurRepository.findByTitreDuLivre(titre);
        if (auteur == null) {
            throw new ResourceNotFoundException(
                    "Aucun auteur trouvé pour le livre : " + titre);
        }
        return ResponseEntity.ok(auteurMapper.toDTO(auteur));
    }

    // ── POST /api/auteurs ─────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody AuteurRequestDTO dto, BindingResult result) {
        // Vérifie si des erreurs de validation existent
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors); // <-- renvoie un JSON avec les erreurs par champ
        }
        // Sinon, création normale
        Auteur auteur = auteurMapper.toEntity(dto);
        Auteur sauvegarde = auteurRepository.save(auteur);

        URI location = URI.create("/api/auteurs/" + sauvegarde.getId());
        return ResponseEntity.created(location).body(auteurMapper.toDTO(sauvegarde));
    }

    // ── PUT /api/auteurs/{id} ─────────────────────────────────────────────
    // Remplace complètement l'auteur (tous les champs doivent être fournis)
    @PutMapping("/{id}")
    public ResponseEntity<AuteurResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody AuteurRequestDTO dto) {

        Auteur existant = auteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auteur", id));

        // Mettre à jour les champs de l'entité existante
        existant.setNom(dto.getNom());
        existant.setPrenom(dto.getPrenom());

        Auteur maj = auteurRepository.save(existant);
        return ResponseEntity.ok(auteurMapper.toDTO(maj)); // HTTP 200 OK
    }

    // ── DELETE /api/auteurs/{id} ──────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Auteur auteur = auteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auteur", id));

        auteurRepository.delete(auteur);
        return ResponseEntity.noContent().build(); // HTTP 204 No Content
    }
}

