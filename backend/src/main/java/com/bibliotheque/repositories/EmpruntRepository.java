package com.bibliotheque.repositories;

import com.bibliotheque.entities.Emprunt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmpruntRepository extends JpaRepository<Emprunt, Long> {
    List<Emprunt> findByUserId(Long userId);
    List<Emprunt> findByUserIdOrderByDateEmpruntDesc(Long userId);
    List<Emprunt> findByStatut(String statut);
    List<Emprunt> findAllByOrderByDateEmpruntDesc();
}
