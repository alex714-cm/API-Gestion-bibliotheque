package com.bibliotheque.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Objet retourné au client pour TOUTES les erreurs de l'API.
 * Sérialisé en JSON par Jackson.
 */
@Data
@Builder
public class ApiError {

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    private int    status;   // code HTTP numérique (404, 400, 409, 500...)
    private String error;    // nom du code ("Not Found", "Bad Request"...)
    private String message;  // message lisible
    private String path;     // URL qui a causé l'erreur

    // liste des erreurs de validation @Valid (null pour les autres erreurs)
    private List<String> details;
}

