package com.bibliotheque.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Levée quand une ressource (Auteur, Livre, Categorie) est introuvable.
 * → réponse HTTP 404 Not Found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceType; // "Auteur", "Livre", "Categorie"
    private final Long   resourceId;

    public ResourceNotFoundException(String resourceType, Long id) {
        super(resourceType + " introuvable avec l'id : " + id);
        this.resourceType = resourceType;
        this.resourceId   = id;
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceType = "Ressource";
        this.resourceId   = null;
    }
}

