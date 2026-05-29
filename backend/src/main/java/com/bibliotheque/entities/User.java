package com.bibliotheque.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    /* Configuration pour résoudre le problème de génération d'ID avec Oracle 9i :
       1. strategy = SEQUENCE : Indique à Hibernate d'utiliser un objet "Sequence" propre à Oracle.
       2. generator : Référence le nom de la configuration définie dans @SequenceGenerator.
    */
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_generator")
    @SequenceGenerator(
            name = "user_generator",
            sequenceName = "USER_SEQ", // Nom du sequence dans l'oracle
            allocationSize = 1         // Incrémente 1 par 1 (Id: 1, 2, 3...)
    )
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "ADMIN" ou "USER"

    private String adresse;
    private String telephone;
}