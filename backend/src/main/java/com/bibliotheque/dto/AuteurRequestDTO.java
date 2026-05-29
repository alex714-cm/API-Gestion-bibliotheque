package com.bibliotheque.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO de REQUÊTE pour Auteur.
 * Utilisé pour la création (POST) et la mise à jour (PUT).
 * Contient les annotations de validation Bean Validation.
 */

@Data
public class AuteurRequestDTO {

    @NotBlank(message = "Le nom de l'auteur est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String nom;

    @NotBlank(message = "Le prénom de l'auteur est obligatoire")
    @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères")
    private String prenom;
    // Pas de liste de livres : on ne crée pas les livres en même temps que l'auteur
}

