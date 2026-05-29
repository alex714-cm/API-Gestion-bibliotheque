package com.bibliotheque.mapper;

import com.bibliotheque.dto.EmpruntResponseDTO;
import com.bibliotheque.entities.Emprunt;
import org.springframework.stereotype.Component;

@Component
public class EmpruntMapper {

    public EmpruntResponseDTO toDTO(Emprunt e) {
        if (e == null) return null;

        String userNomComplet = "Utilisateur inconnu";
        if (e.getUser() != null) {
            String f = e.getUser().getFirstName() != null ? e.getUser().getFirstName() : "";
            String l = e.getUser().getLastName() != null ? e.getUser().getLastName() : "";
            userNomComplet = (f + " " + l).trim();
        }

        return EmpruntResponseDTO.builder()
                .id(e.getId())
                .livreId(e.getLivre() != null ? e.getLivre().getId() : null)
                .livreTitre(e.getLivre() != null ? e.getLivre().getTitre() : "Livre inconnu")
                .livreImageUrl(e.getLivre() != null ? e.getLivre().getImageUrl() : null)
                .livrePrix(e.getLivre() != null ? e.getLivre().getPrix() : null)
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .userEmail(e.getUser() != null ? e.getUser().getEmail() : null)
                .userNomComplet(userNomComplet)
                .dateEmprunt(e.getDateEmprunt())
                .dateRetourPrevue(e.getDateRetourPrevue())
                .dateRetourEffective(e.getDateRetourEffective())
                .statut(e.getStatut())
                .build();
    }
}
