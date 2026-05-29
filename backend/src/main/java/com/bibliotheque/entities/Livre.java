package com.bibliotheque.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Livre {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "livre_seq")
    @SequenceGenerator(name = "livre_seq", sequenceName = "LIVRE_SEQ", allocationSize = 1)
    private Long id;

    private String titre;

    // prix et description
    private Double prix;

    @Column(length = 1000)
    private String description;

    private String imageUrl;
    private Integer quantite;

    // FetchType.EAGER get livre auteur el livre
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auteur_id")
    @JsonIgnoreProperties("livres")
    private Auteur auteur;

    @ManyToMany
    @JoinTable(
            name = "livre_categories",
            joinColumns = @JoinColumn(name = "livre_id"),
            inverseJoinColumns = @JoinColumn(name = "categorie_id")
    )
    @JsonIgnoreProperties("livres")
    private List<Categorie> categories;

    public int getNombreCategories() {
        return (categories != null) ? categories.size() : 0;
    }
}