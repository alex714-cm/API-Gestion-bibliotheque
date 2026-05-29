package com.bibliotheque.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class EmpruntResponseDTO {
    private Long id;
    
    // Details Livre
    private Long livreId;
    private String livreTitre;
    private String livreImageUrl;
    private Double livrePrix;
    
    // Details User
    private Long userId;
    private String userEmail;
    private String userNomComplet;
    
    // Dates
    private LocalDate dateEmprunt;
    private LocalDate dateRetourPrevue;
    private LocalDate dateRetourEffective;
    
    // Statut
    private String statut;
}
