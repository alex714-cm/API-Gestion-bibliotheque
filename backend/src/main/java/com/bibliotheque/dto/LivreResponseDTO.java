package com.bibliotheque.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * DTO de RÉPONSE pour Livre.
 * Inclut le nom complet de l'auteur et les libellés des catégories.
 * Pas d'objets imbriqués → zéro risque de boucle JSON.
 */
@Data
@Builder
public class LivreResponseDTO {
    private Long id;
    private String titre;
    private Double prix;
    private String description;
    private String imageUrl;
    private Integer quantite;
    private Long auteurId;
    private String nomAuteur;
    private List<String> categories;
    private int nombreCategories;
}

