package com.bibliotheque.repositories;

import com.bibliotheque.entities.Auteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AuteurRepository extends JpaRepository<Auteur,Long> {
    // Recherche les auteurs dont le nom commence par une lettre spécifique
    List<Auteur> findByNomStartingWith(String prefixe);

    // @Query JPQL : Trouver l'auteur qui a écrit un livre spécifique
    @Query("SELECT a FROM Auteur a JOIN a.livres l WHERE l.titre = :titreLivre")
    Auteur findByTitreDuLivre(@Param("titreLivre") String titreLivre);
}
