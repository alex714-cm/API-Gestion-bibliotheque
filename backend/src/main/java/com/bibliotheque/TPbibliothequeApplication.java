package com.bibliotheque;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TPbibliothequeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TPbibliothequeApplication.class, args);
        System.out.println("Backend connecté à Votre DB-Oracle!");
    }
}