package com.bibliotheque.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class LivreRequestDTO {

    @NotBlank(message = "Le titre du livre est obligatoire")
    @Size(min = 1, max = 200, message = "Le titre doit avoir entre 1 et 200 caractères")
    private String titre;

    //prix validation (min 0.0)
    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", message = "Le prix doit être positif")
    private Double prix;

    //validation description
    @Size(max = 1000, message = "La description ne peut pas dépasser 1000 caractères")
    private String description;

    // Validation pour l'URL de l'image (peut être vide mais limitée en taille)
    @Size(max = 500, message = "L'URL de l'image est trop longue")
    private String imageUrl;

    // Validation de la quantité (doit être un entier positif ou zéro)
    @NotNull(message = "La quantité en stock est obligatoire")
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer quantite;

    @NotNull(message = "L'identifiant de l'auteur est obligatoire")
    private Long auteurId;

    private List<Long> categorieIds;
}