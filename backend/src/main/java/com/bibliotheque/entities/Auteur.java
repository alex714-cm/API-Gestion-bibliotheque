package com.bibliotheque.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auteur {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "etudiant_seq")
    @SequenceGenerator(
            name = "auteur_seq",          // nom utilisé dans generator
            sequenceName = "AUTEUR_SEQ",  // nom dans Oracle
            allocationSize = 1
    )
    private Long  id;
    private String nom;
    private String prenom;

    @OneToMany(mappedBy = "auteur", cascade = CascadeType.ALL)
    @JsonIgnore //eviter loop infine
    private List<Livre> livres;


    public String getNomComplet() {
        return (nom != null ? nom : "") + " " + (prenom != null ? prenom : "");
    }
}
