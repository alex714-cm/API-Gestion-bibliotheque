package com.bibliotheque.mapper;

import com.bibliotheque.dto.AuteurRequestDTO;
import com.bibliotheque.dto.AuteurResponseDTO;
import com.bibliotheque.entities.Auteur;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class AuteurMapper {

    /**
     * RequestDTO → Entité
     * Utilisé lors de la création (POST) et de la mise à jour (PUT).
     */
    public Auteur toEntity(AuteurRequestDTO dto) {
        if (dto == null) return null;
        Auteur a = new Auteur();
        a.setNom(dto.getNom());
        a.setPrenom(dto.getPrenom());
        // La liste des livres est gérée séparément
        return a;
    }

    /**
     * Entité → ResponseDTO
     * Utilisé dans toutes les réponses (GET, POST, PUT).
     */
    public AuteurResponseDTO toDTO(Auteur a) {
        if (a == null) return null;

        // Extraire les titres des livres (si la liste n'est pas null)
        var titres = (a.getLivres() == null)
                ? Collections.<String>emptyList()
                : a.getLivres().stream()
                .map(l -> l.getTitre())
                .collect(Collectors.toList());

        return AuteurResponseDTO.builder()
                .id(a.getId())
                .nom(a.getNom())
                .prenom(a.getPrenom())
                .nomComplet(a.getPrenom() + " " + a.getNom())  // champ calculé
                .titresLivres(titres)
                .nombreLivres(titres.size())
                .build();
    }
}

