package com.bibliotheque.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "emprunts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Emprunt {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emprunt_seq")
    @SequenceGenerator(name = "emprunt_seq", sequenceName = "EMPRUNT_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "livre_id", nullable = false)
    private Livre livre;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate dateEmprunt;

    @Column(nullable = false)
    private LocalDate dateRetourPrevue;

    private LocalDate dateRetourEffective;

    @Column(nullable = false)
    private String statut; // "EN_COURS", "RENDU", "RETARD"
}
