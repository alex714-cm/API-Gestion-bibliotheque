package com.bibliotheque.mapper;

import com.bibliotheque.dto.CategorieRequestDTO;
import com.bibliotheque.dto.CategorieResponseDTO;
import com.bibliotheque.entities.Categorie;
import org.springframework.stereotype.Component;

@Component
public class CategorieMapper {

    public Categorie toEntity(CategorieRequestDTO dto) {
        if (dto == null) return null;
        Categorie c = new Categorie();
        c.setLibelle(dto.getLibelle());
        return c;
    }

    public CategorieResponseDTO toDTO(Categorie c) {
        if (c == null) return null;

        int nbLivres = (c.getLivres() == null) ? 0 : c.getLivres().size();

        return CategorieResponseDTO.builder()
                .id(c.getId())
                .libelle(c.getLibelle())
                .nombreLivres(nbLivres)
                .build();
    }
}

