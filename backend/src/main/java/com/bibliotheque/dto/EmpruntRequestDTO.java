package com.bibliotheque.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmpruntRequestDTO {
    @NotNull(message = "L'identifiant du livre est obligatoire")
    private Long livreId;

    @NotNull(message = "L'identifiant de l'utilisateur est obligatoire")
    private Long userId;
}
