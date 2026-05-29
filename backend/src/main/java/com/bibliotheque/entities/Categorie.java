package com.bibliotheque.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Categorie {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "etudiant_seq")
    @SequenceGenerator(
            name = "categorie_seq",          // nom utilisé dans generator
            sequenceName = "CATEGORIE_SEQ",  // nom dans Oracle
            allocationSize = 1
    )
    private Long id;
    private String libelle;

    @ManyToMany(mappedBy = "categories")
    @com.fasterxml.jackson.annotation.JsonIgnore //eviter la boucle infinie
    private List<Livre> livres;
}
