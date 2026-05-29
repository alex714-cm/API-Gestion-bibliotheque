package com.bibliotheque.mapper;

import com.bibliotheque.dto.LivreRequestDTO;
import com.bibliotheque.dto.LivreResponseDTO;
import com.bibliotheque.entities.Categorie;
import com.bibliotheque.entities.Livre;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class LivreMapper {

    /**
     * Conversion RequestDTO → Entité
     * Note : L'auteur et les catégories sont chargés et assignés dans le Service.
     */
    public Livre toEntity(LivreRequestDTO dto) {
        if (dto == null) return null;

        Livre l = new Livre();
        l.setTitre(dto.getTitre());
        l.setPrix(dto.getPrix());
        l.setDescription(dto.getDescription());

        //securisation
        l.setImageUrl(dto.getImageUrl());
        l.setQuantite(dto.getQuantite() != null ? dto.getQuantite() : 0); // Évite le null pour Oracle
        l.setPrix(dto.getPrix() != null ? dto.getPrix() : 0.0);

        return l;
    }

    /**
     * Conversion Entité → ResponseDTO
     * Aplatit les relations pour faciliter l'affichage côté React.
     */
    public LivreResponseDTO toDTO(Livre l) {
        if (l == null) return null;

        // Logique pour récupérer le nom complet de l'auteur
        String nomAuteur = (l.getAuteur() == null)
                ? "Auteur inconnu"
                : l.getAuteur().getPrenom() + " " + l.getAuteur().getNom();

        // Transformation de la liste des catégories en liste de libellés (Strings)
        List<String> libelles = (l.getCategories() == null)
                ? Collections.emptyList()
                : l.getCategories().stream()
                .map(Categorie::getLibelle)
                .collect(Collectors.toList());

        return LivreResponseDTO.builder()
                .id(l.getId())
                .titre(l.getTitre())
                .prix(l.getPrix())
                .description(l.getDescription())


                .imageUrl(l.getImageUrl())
                .quantite(l.getQuantite())

                .auteurId(l.getAuteur() != null ? l.getAuteur().getId() : null)
                .nomAuteur(nomAuteur)
                .categories(libelles)
                .nombreCategories(libelles.size())
                .build();
    }
}
