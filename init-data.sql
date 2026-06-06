-- Nettoyage et réinitialisation complète des données
DELETE FROM livre_categories;
DELETE FROM emprunts;
DELETE FROM livre;
DELETE FROM categorie;
DELETE FROM auteur;
DELETE FROM users;
COMMIT;

-- Auteurs (avec ETUDIANT_SEQ qui est la seule séquence disponible pour les IDs)
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Martin', 'Robert C.');
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Fowler', 'Martin');
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Gamma', 'Erich');
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Knuth', 'Donald');
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Orwell', 'George');
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Hugo', 'Victor');
INSERT INTO auteur (id, nom, prenom) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Hawking', 'Stephen');
COMMIT;

-- Catégories
INSERT INTO categorie (id, libelle) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Programmation');
INSERT INTO categorie (id, libelle) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Litterature');
INSERT INTO categorie (id, libelle) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Science');
INSERT INTO categorie (id, libelle) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Architecture');
INSERT INTO categorie (id, libelle) VALUES (ETUDIANT_SEQ.NEXTVAL, 'Base de données');
COMMIT;

-- Livres avec auteur_id correct
INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Clean Code',
    'Un guide pour ecrire du code propre, lisible et maintenable.',
    35.99, 5,
    (SELECT id FROM auteur WHERE nom='Martin'),
    'https://m.media-amazon.com/images/I/41xShlnTZTL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Refactoring',
    'Ameliorer la conception du code existant pas a pas.',
    42.50, 3,
    (SELECT id FROM auteur WHERE nom='Fowler'),
    'https://m.media-amazon.com/images/I/41LBzpPXCOL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Design Patterns',
    'Solutions reutilisables pour des problemes courants en conception logicielle.',
    48.00, 4,
    (SELECT id FROM auteur WHERE nom='Gamma'),
    'https://m.media-amazon.com/images/I/51kuc0iWoKL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'The Art of Computer Programming',
    'La reference ultime de l algorithmique et de la programmation.',
    89.99, 2,
    (SELECT id FROM auteur WHERE nom='Knuth'),
    'https://m.media-amazon.com/images/I/41WPjxNjMqL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, '1984',
    'Un roman dystopique sur la surveillance et le totalitarisme.',
    12.99, 8,
    (SELECT id FROM auteur WHERE nom='Orwell'),
    'https://m.media-amazon.com/images/I/41aM4xOZxaL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Les Miserables',
    'Le chef-d oeuvre de la litterature francaise sur la justice et la redemption.',
    15.50, 6,
    (SELECT id FROM auteur WHERE nom='Hugo'),
    'https://m.media-amazon.com/images/I/51m3v2J2+9L.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Une breve histoire du temps',
    'L univers, le Big Bang et les trous noirs expliques pour tous.',
    18.00, 4,
    (SELECT id FROM auteur WHERE nom='Hawking'),
    'https://m.media-amazon.com/images/I/51xwGSNX-EL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Clean Architecture',
    'Un guide pour creer des architectures logicielles durables et propres.',
    38.00, 3,
    (SELECT id FROM auteur WHERE nom='Martin'),
    'https://m.media-amazon.com/images/I/41BjtnvIUQL.jpg');

INSERT INTO livre (id, titre, description, prix, quantite, auteur_id, image_url)
VALUES (LIVRE_SEQ.NEXTVAL, 'Le Petit Prince',
    'Un conte poetique et philosophique pour adultes et enfants.',
    9.99, 10,
    (SELECT id FROM auteur WHERE nom='Hawking'),
    'https://m.media-amazon.com/images/I/41sHJeZ3pFL.jpg');

COMMIT;

-- Associations Livres / Catégories
INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Clean Code'), (SELECT id FROM categorie WHERE libelle='Programmation'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Refactoring'), (SELECT id FROM categorie WHERE libelle='Programmation'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Design Patterns'), (SELECT id FROM categorie WHERE libelle='Programmation'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Design Patterns'), (SELECT id FROM categorie WHERE libelle='Architecture'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='The Art of Computer Programming'), (SELECT id FROM categorie WHERE libelle='Programmation'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='1984'), (SELECT id FROM categorie WHERE libelle='Litterature'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Les Miserables'), (SELECT id FROM categorie WHERE libelle='Litterature'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Une breve histoire du temps'), (SELECT id FROM categorie WHERE libelle='Science'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Clean Architecture'), (SELECT id FROM categorie WHERE libelle='Programmation'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Clean Architecture'), (SELECT id FROM categorie WHERE libelle='Architecture'));

INSERT INTO livre_categories (livre_id, categorie_id)
VALUES ((SELECT id FROM livre WHERE titre='Le Petit Prince'), (SELECT id FROM categorie WHERE libelle='Litterature'));

COMMIT;

-- Compte Admin par défaut (mot de passe: admin123)
INSERT INTO users (id, first_name, last_name, email, password, role)
VALUES (
    USER_SEQ.NEXTVAL,
    'Admin',
    'LivreMoi',
    'admin@livremoi.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVKfQLq0k2',
    'ADMIN'
);

-- Compte User par défaut (mot de passe: user123)
INSERT INTO users (id, first_name, last_name, email, password, role)
VALUES (
    USER_SEQ.NEXTVAL,
    'User',
    'LivreMoi',
    'user@livremoi.com',
    '$2a$10$SVbPGsH5LJ1wSe7Qym3xteSIctYcF3urPcrmbxuT5mORJ3Za9pGIO',
    'USER'
);

COMMIT;
