package com.bibliotheque.repositories;

import com.bibliotheque.entities.Livre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LivreRepository extends JpaRepository<Livre,Long> {
    // 1. Query Method : Recherche exacte par titre
    List<Livre> findByTitre(String titre);

    // 2. Query Method : Recherche par mot-clé (Contient)
    List<Livre> findByTitreContaining(String motCle);

    // 3. Recherche par le nom de l'auteur (Navigation d'objet)
    List<Livre> findByAuteurNom(String nomAuteur);

    // 4. @Query JPQL : Sélectionner les livres d'une catégorie spécifique par son libellé
    @Query("SELECT l FROM Livre l JOIN l.categories c WHERE c.libelle = :libelle")
    List<Livre> findByCategorieLibelle(@Param("libelle") String libelle);

    // 5. Requête Native SQL : Compter le nombre total de livres
    @Query(value = "SELECT COUNT(*) FROM livre", nativeQuery = true)
    long countAllLivres();

    // 6. Recherche globale par titre, auteur (nom ou prenom) ou libellé de catégorie
    @Query("SELECT DISTINCT l FROM Livre l " +
           "LEFT JOIN l.auteur a " +
           "LEFT JOIN l.categories c " +
           "WHERE LOWER(l.titre) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.prenom) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.libelle) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Livre> searchAllFields(@Param("query") String query);
}

