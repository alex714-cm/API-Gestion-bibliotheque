package com.bibliotheque.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Data
public class CategorieRequestDTO {

    @NotBlank(message = "Le libellé de la catégorie est obligatoire")
    @Size(min = 2, max = 80, message = "Le libellé doit avoir entre 2 et 80 caractères")
    private String libelle;
}
