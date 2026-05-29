package com.bibliotheque.controller;

import com.bibliotheque.dto.LivreRequestDTO;
import com.bibliotheque.dto.LivreResponseDTO;
import com.bibliotheque.service.LivreService; // Import du service
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/livres")
@CrossOrigin("*") // Autorise React
public class LivreController {

    private final LivreService livreService;

    // Injection via constructeur (plus propre que @Autowired)
    public LivreController(LivreService livreService) {
        this.livreService = livreService;
    }

    // ── GET ALL ───────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<LivreResponseDTO>> getAll() {
        return ResponseEntity.ok(livreService.getAllLivres());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<LivreResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(livreService.getLivreById(id));
    }

    // ── POST (CREATE) ─────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<LivreResponseDTO> create(@Valid @RequestBody LivreRequestDTO dto) {
        LivreResponseDTO nouveau = livreService.createLivre(dto);
        URI location = URI.create("/api/livres/" + nouveau.getId());
        return ResponseEntity.created(location).body(nouveau);
    }

    // ── PUT (UPDATE) ──────────────────────────────────────────────────────
    // Utilise maintenant ton service qui gère ImageUrl et Quantite !
    @PutMapping("/{id}")
    public ResponseEntity<LivreResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody LivreRequestDTO dto) {

        LivreResponseDTO updated = livreService.updateLivre(id, dto);
        return ResponseEntity.ok(updated);
    }

    // ── DELETE ────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        livreService.deleteLivre(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categorie/{libelle}")
    public ResponseEntity<List<LivreResponseDTO>> getByCategorie(@PathVariable String libelle) {
        return ResponseEntity.ok(livreService.getLivresByCategorie(libelle));
    }

    // ── RECHERCHES ────────────────────────────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<List<LivreResponseDTO>> search(
            @RequestParam(required = false) String titre,
            @RequestParam(required = false) String motcle) {
        return ResponseEntity.ok(livreService.searchLivres(titre, motcle));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(livreService.countTotalLivres());
    }
}