package com.bibliotheque.service;

import com.bibliotheque.dto.LivreRequestDTO;
import com.bibliotheque.dto.LivreResponseDTO;
import com.bibliotheque.entities.Auteur;
import com.bibliotheque.entities.Categorie;
import com.bibliotheque.entities.Livre;
import com.bibliotheque.exception.ResourceNotFoundException;
import com.bibliotheque.mapper.LivreMapper;
import com.bibliotheque.repositories.AuteurRepository;
import com.bibliotheque.repositories.CategorieRepository;
import com.bibliotheque.repositories.LivreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LivreService {

    @Autowired
    private LivreRepository livreRepository;

    @Autowired
    private AuteurRepository auteurRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private LivreMapper mapper;

    // ── MÉTHODE UPDATE (CORRIGÉE) ────────────────────────────────────────
    @Transactional
    public LivreResponseDTO updateLivre(Long id, LivreRequestDTO dto) {
        // 1. Récupération du livre existant
        Livre livre = livreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livre", id));

        // 2. Mise à jour des champs simples (IMAGE ET QUANTITÉ INCLUS)
        livre.setTitre(dto.getTitre());
        livre.setPrix(dto.getPrix());
        livre.setDescription(dto.getDescription());
        livre.setImageUrl(dto.getImageUrl());
        livre.setQuantite(dto.getQuantite());

        // 3. Gestion de l'Auteur
        if (dto.getAuteurId() != null) {
            Auteur auteur = auteurRepository.findById(dto.getAuteurId())
                    .orElseThrow(() -> new ResourceNotFoundException("Auteur", dto.getAuteurId()));
            livre.setAuteur(auteur);
        }

        // 4. Gestion des Catégories (Logique déplacée du Controller vers ici)
        if (dto.getCategorieIds() != null) {
            List<Categorie> categories = new ArrayList<>();
            for (Long catId : dto.getCategorieIds()) {
                Categorie cat = categorieRepository.findById(catId)
                        .orElseThrow(() -> new ResourceNotFoundException("Categorie", catId));
                categories.add(cat);
            }
            livre.setCategories(categories);
        }

        // 5. Sauvegarde et retour
        return mapper.toDTO(livreRepository.save(livre));
    }

    // ── AUTRES MÉTHODES NÉCESSAIRES AU CONTROLLER ────────────────────────

    @Transactional(readOnly = true)
    public List<LivreResponseDTO> getAllLivres() {
        return livreRepository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LivreResponseDTO getLivreById(Long id) {
        Livre livre = livreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livre", id));
        return mapper.toDTO(livre);
    }

    @Transactional
    public LivreResponseDTO createLivre(LivreRequestDTO dto) {
        Livre livre = mapper.toEntity(dto);

        // On réutilise la même logique pour l'auteur et les catégories
        Auteur auteur = auteurRepository.findById(dto.getAuteurId())
                .orElseThrow(() -> new ResourceNotFoundException("Auteur", dto.getAuteurId()));
        livre.setAuteur(auteur);

        if (dto.getCategorieIds() != null) {
            List<Categorie> categories = categorieRepository.findAllById(dto.getCategorieIds());
            livre.setCategories(categories);
        }

        return mapper.toDTO(livreRepository.save(livre));
    }

    @Transactional
    public void deleteLivre(Long id) {
        if (!livreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Livre", id);
        }
        livreRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<LivreResponseDTO> searchLivres(String titre, String motcle) {
        List<Livre> livres;
        if (titre != null && !titre.isBlank()) {
            livres = livreRepository.findByTitre(titre);
        } else if (motcle != null && !motcle.isBlank()) {
            livres = livreRepository.searchAllFields(motcle);
        } else {
            livres = livreRepository.findAll();
        }
        return livres.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LivreResponseDTO> getLivresByCategorie(String libelle) {
        return livreRepository.findByCategorieLibelle(libelle).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public long countTotalLivres() {
        return livreRepository.countAllLivres();
    }
}