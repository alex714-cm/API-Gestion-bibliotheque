package com.bibliotheque.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String adresse;
    private String telephone;
}
