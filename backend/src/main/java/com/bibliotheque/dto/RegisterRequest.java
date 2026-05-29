package com.bibliotheque.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role; // "USER" ou "ADMIN"
    private String adresse;
    private String telephone;

    // Getters et Setters
}