package com.bibliotheque.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategorieResponseDTO {

    private Long   id;
    private String libelle;
    private int    nombreLivres; // champ calculé : combien de livres dans cette catégorie
}

