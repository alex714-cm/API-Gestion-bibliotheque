package com.bibliotheque.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * DTO de RÉPONSE pour Auteur.
 * Renvoyé au client dans les réponses GET, POST, PUT.
 * Inclut le nombre de livres et leurs titres (pas les objets Livre complets).
 */
@Data
@Builder
public class AuteurResponseDTO {

    private Long    id;
    private String  nom;
    private String  prenom;
    private String  nomComplet;       // champ calculé : prenom + " " + nom

    // On inclut seulement les TITRES, pas les objets Livre complets
    // → évite les boucles de sérialisation JSON
    private List<String> titresLivres;
    private int          nombreLivres; // champ calculé
}

