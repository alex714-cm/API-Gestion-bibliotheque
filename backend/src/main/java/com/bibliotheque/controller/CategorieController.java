package com.bibliotheque.controller;

import com.bibliotheque.dto.CategorieRequestDTO;
import com.bibliotheque.dto.CategorieResponseDTO;
import com.bibliotheque.entities.Categorie;
import com.bibliotheque.exception.ResourceNotFoundException;
import com.bibliotheque.mapper.CategorieMapper;
import com.bibliotheque.repositories.CategorieRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller pour la ressource Categorie.
 *
 * Endpoints :
 *   GET    /api/categories        → liste toutes les catégories
 *   GET    /api/categories/{id}   → détail d'une catégorie
 *   POST   /api/categories        → créer une catégorie
 *   PUT    /api/categories/{id}   → modifier une catégorie
 *   DELETE /api/categories/{id}   → supprimer une catégorie
 */
@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class CategorieController {

    private final CategorieRepository categorieRepository;
    private final CategorieMapper     categorieMapper;

    public CategorieController(CategorieRepository categorieRepository,
                               CategorieMapper categorieMapper) {
        this.categorieRepository = categorieRepository;
        this.categorieMapper     = categorieMapper;
    }

    // ── GET /api/categories ───────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<CategorieResponseDTO>> getAll() {
        List<CategorieResponseDTO> dtos = categorieRepository.findAll()
                .stream()
                .map(categorieMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ── GET /api/categories/{id} ──────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<CategorieResponseDTO> getById(@PathVariable Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", id));
        return ResponseEntity.ok(categorieMapper.toDTO(categorie));
    }

    // ── POST /api/categories ──────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<CategorieResponseDTO> create(
            @Valid @RequestBody CategorieRequestDTO dto) {

        // Vérifier si le libellé existe déjà (règle métier)
        boolean existe = categorieRepository.findAll()
                .stream()
                .anyMatch(c -> c.getLibelle().equalsIgnoreCase(dto.getLibelle()));
        if (existe) {
            throw new IllegalStateException(
                    "Une catégorie avec le libellé '" + dto.getLibelle() + "' existe déjà");
            // → GlobalExceptionHandler → 409 Conflict
        }

        Categorie sauvegarde = categorieRepository.save(categorieMapper.toEntity(dto));
        URI location = URI.create("/api/categories/" + sauvegarde.getId());
        return ResponseEntity.created(location)
                .body(categorieMapper.toDTO(sauvegarde));
    }

    // ── PUT /api/categories/{id} ──────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<CategorieResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CategorieRequestDTO dto) {

        Categorie existante = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", id));

        existante.setLibelle(dto.getLibelle());
        Categorie maj = categorieRepository.save(existante);
        return ResponseEntity.ok(categorieMapper.toDTO(maj));
    }

    // ── DELETE /api/categories/{id} ───────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", id));
        categorieRepository.delete(categorie);
        return ResponseEntity.noContent().build();
    }
}

