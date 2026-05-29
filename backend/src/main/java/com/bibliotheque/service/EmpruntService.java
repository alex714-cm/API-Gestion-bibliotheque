package com.bibliotheque.service;

import com.bibliotheque.dto.EmpruntRequestDTO;
import com.bibliotheque.dto.EmpruntResponseDTO;
import com.bibliotheque.entities.Emprunt;
import com.bibliotheque.entities.Livre;
import com.bibliotheque.entities.User;
import com.bibliotheque.exception.ResourceNotFoundException;
import com.bibliotheque.mapper.EmpruntMapper;
import com.bibliotheque.repositories.EmpruntRepository;
import com.bibliotheque.repositories.LivreRepository;
import com.bibliotheque.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmpruntService {

    @Autowired
    private EmpruntRepository empruntRepository;

    @Autowired
    private LivreRepository livreRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpruntMapper mapper;

    // Mettre à jour dynamiquement les statuts en retard (RETARD) avant de retourner les données
    private void checkAndUpdateOverdue(Emprunt e) {
        if (e.getDateRetourEffective() == null && "EN_COURS".equals(e.getStatut())) {
            if (LocalDate.now().isAfter(e.getDateRetourPrevue())) {
                e.setStatut("RETARD");
                empruntRepository.save(e);
            }
        }
    }

    @Transactional
    public EmpruntResponseDTO emprunter(EmpruntRequestDTO dto) {
        Livre livre = livreRepository.findById(dto.getLivreId())
                .orElseThrow(() -> new ResourceNotFoundException("Livre", dto.getLivreId()));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", dto.getUserId()));

        if (livre.getQuantite() == null || livre.getQuantite() <= 0) {
            throw new RuntimeException("Désolé, ce livre n'est plus en stock pour l'emprunt.");
        }

        // Décrémenter la quantité
        livre.setQuantite(livre.getQuantite() - 1);
        livreRepository.save(livre);

        Emprunt e = new Emprunt();
        e.setLivre(livre);
        e.setUser(user);
        e.setDateEmprunt(LocalDate.now());
        e.setDateRetourPrevue(LocalDate.now().plusDays(14)); // Durée d'emprunt standard : 14 jours
        e.setStatut("EN_COURS");

        return mapper.toDTO(empruntRepository.save(e));
    }

    @Transactional
    public EmpruntResponseDTO retourner(Long id) {
        Emprunt e = empruntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt", id));

        if (e.getDateRetourEffective() != null) {
            throw new RuntimeException("Cet emprunt a déjà été retourné.");
        }

        e.setDateRetourEffective(LocalDate.now());
        e.setStatut("RENDU");

        // Incrémenter la quantité en stock
        Livre livre = e.getLivre();
        if (livre != null) {
            livre.setQuantite((livre.getQuantite() != null ? livre.getQuantite() : 0) + 1);
            livreRepository.save(livre);
        }

        return mapper.toDTO(empruntRepository.save(e));
    }

    @Transactional
    public EmpruntResponseDTO annuler(Long id) {
        Emprunt e = empruntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt", id));

        if (!"EN_COURS".equals(e.getStatut()) && !"RETARD".equals(e.getStatut())) {
            throw new RuntimeException("Cet emprunt ne peut plus être annulé.");
        }

        e.setStatut("ANNULE");

        // Incrémenter la quantité en stock
        Livre livre = e.getLivre();
        if (livre != null) {
            livre.setQuantite((livre.getQuantite() != null ? livre.getQuantite() : 0) + 1);
            livreRepository.save(livre);
        }

        return mapper.toDTO(empruntRepository.save(e));
    }

    @Transactional
    public EmpruntResponseDTO modifierDateRetourPrevue(Long id, LocalDate nouvelleDate) {
        Emprunt e = empruntRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Emprunt", id));

        if (nouvelleDate.isBefore(LocalDate.now()) && !nouvelleDate.isEqual(LocalDate.now())) {
            throw new RuntimeException("La nouvelle date doit être dans le futur.");
        }

        if (e.getDateRetourEffective() != null) {
            throw new RuntimeException("Cet emprunt a déjà été retourné.");
        }

        e.setDateRetourPrevue(nouvelleDate);
        
        if (LocalDate.now().isAfter(e.getDateRetourPrevue())) {
            e.setStatut("RETARD");
        } else {
            e.setStatut("EN_COURS");
        }

        return mapper.toDTO(empruntRepository.save(e));
    }

    @Transactional
    public List<EmpruntResponseDTO> getEmpruntsByUser(Long userId) {
        List<Emprunt> list = empruntRepository.findByUserIdOrderByDateEmpruntDesc(userId);
        list.forEach(this::checkAndUpdateOverdue);
        return list.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<EmpruntResponseDTO> getAllEmprunts() {
        List<Emprunt> list = empruntRepository.findAllByOrderByDateEmpruntDesc();
        list.forEach(this::checkAndUpdateOverdue);
        return list.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<EmpruntResponseDTO> getEmpruntsEnCours() {
        List<Emprunt> list = empruntRepository.findByStatut("EN_COURS");
        List<Emprunt> retard = empruntRepository.findByStatut("RETARD");
        list.addAll(retard);
        list.forEach(this::checkAndUpdateOverdue);
        return list.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> getDashboardStats() {
        long totalLivres = livreRepository.count();
        long totalUsers = userRepository.countByRole("USER");
        List<Emprunt> allEmprunts = empruntRepository.findAll();
        allEmprunts.forEach(this::checkAndUpdateOverdue);

        long enCours = allEmprunts.stream().filter(e -> "EN_COURS".equals(e.getStatut())).count();
        long rendus = allEmprunts.stream().filter(e -> "RENDU".equals(e.getStatut())).count();
        long retards = allEmprunts.stream().filter(e -> "RETARD".equals(e.getStatut())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLivres", totalLivres);
        stats.put("totalUsers", totalUsers);
        stats.put("totalEmprunts", allEmprunts.size());
        stats.put("empruntsEnCours", enCours + retards);
        stats.put("empruntsRendus", rendus);
        stats.put("empruntsRetards", retards);
        return stats;
    }
}
