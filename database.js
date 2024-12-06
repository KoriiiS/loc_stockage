const Database = require("better-sqlite3");
const db = new Database("data.db");

// Création des tables si elles n'existent pas
db.exec(`
  CREATE TABLE IF NOT EXISTS equipements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      stock INTEGER NOT NULL,
      categorie_id INTEGER, -- Assure-toi que cette ligne existe
      FOREIGN KEY(categorie_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipement_id INTEGER NOT NULL,
      locataire TEXT NOT NULL,
      date_prise TEXT NOT NULL,
      date_retour TEXT NOT NULL,
      quantite INTEGER NOT NULL,
      FOREIGN KEY(equipement_id) REFERENCES equipements(id)
  );

  CREATE TABLE IF NOT EXISTS historique (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipement TEXT NOT NULL,
      locataire TEXT NOT NULL,
      date_prise TEXT NOT NULL,
      date_retour TEXT NOT NULL,
      quantite INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE
  );
`);

// Vérifie si la colonne categorie_id existe
const columnExists = db
  .prepare("PRAGMA table_info(equipements)")
  .all()
  .some((col) => col.name === "categorie_id");

if (!columnExists) {
  // Ajoute la colonne si elle n'existe pas
  db.exec("ALTER TABLE equipements ADD COLUMN categorie_id INTEGER;");
}

// Ajout des catégories prédéfinies si elles n'existent pas déjà
const predefinedCategories = [
  "Caméras",
  "Optiques",
  "Énergie",
  "Machinerie",
  "Mémoire et divers",
  "Lumière",
  "Régie",
  "Audio",
  "Câble",
  "Kit",
];

predefinedCategories.forEach((category) => {
  const existing = db
    .prepare("SELECT COUNT(*) AS count FROM categories WHERE nom = ?")
    .get(category);
  if (existing.count === 0) {
    db.prepare("INSERT INTO categories (nom) VALUES (?)").run(category);
  }
});

// Fonctions pour récupérer les catégories
function getCategories() {
  return db.prepare("SELECT * FROM categories").all();
}

// Fonctions pour gérer les équipements
function getEquipements() {
  return db.prepare("SELECT * FROM equipements").all();
}

function addEquipement(nom, stock, categorie_id) {
  db.prepare(
    "INSERT INTO equipements (nom, stock, categorie_id) VALUES (?, ?, ?)"
  ).run(nom, stock, categorie_id);
}

function updateEquipement(id, nom, stock) {
  db.prepare("UPDATE equipements SET nom = ?, stock = ? WHERE id = ?").run(
    nom,
    stock,
    id
  );
}

function deleteEquipement(id) {
  db.prepare("DELETE FROM equipements WHERE id = ?").run(id);
}

// Fonctions pour gérer les locations
function getLocations() {
  return db
    .prepare(
      `
        SELECT l.id, e.nom AS equipement, l.locataire, l.date_prise, l.date_retour, l.quantite
        FROM locations l
        JOIN equipements e ON l.equipement_id = e.id
    `
    )
    .all();
}

function addLocation(
  equipement_id,
  locataire,
  date_prise,
  date_retour,
  quantite
) {
  db.prepare(
    `
        INSERT INTO locations (equipement_id, locataire, date_prise, date_retour, quantite)
        VALUES (?, ?, ?, ?, ?)
    `
  ).run(equipement_id, locataire, date_prise, date_retour, quantite);

  // Réduire la quantité disponible dans le stock
  db.prepare(
    `
        UPDATE equipements
        SET stock = stock - ?
        WHERE id = ?
    `
  ).run(quantite, equipement_id);
}

function returnLocation(locationId) {
  const location = db
    .prepare(
      `
        SELECT e.nom AS equipement, l.locataire, l.date_prise, l.date_retour, l.quantite
        FROM locations l
        JOIN equipements e ON l.equipement_id = e.id
        WHERE l.id = ?
    `
    )
    .get(locationId);

  if (!location) {
    throw new Error("Location introuvable.");
  }

  db.prepare(
    `
        UPDATE equipements
        SET stock = stock + ?
        WHERE id = (
            SELECT equipement_id
            FROM locations
            WHERE id = ?
        )
    `
  ).run(location.quantite, locationId);

  db.prepare(`DELETE FROM locations WHERE id = ?`).run(locationId);

  db.prepare(
    `
        INSERT INTO historique (equipement, locataire, date_prise, date_retour, quantite)
        VALUES (?, ?, ?, ?, ?)
    `
  ).run(
    location.equipement,
    location.locataire,
    location.date_prise,
    location.date_retour,
    location.quantite
  );
}

function getHistorique() {
  return db.prepare("SELECT * FROM historique").all();
}

function clearHistorique() {
  db.prepare("DELETE FROM historique").run();
}

// Exporter toutes les fonctions
module.exports = {
  getEquipements,
  addEquipement,
  updateEquipement,
  deleteEquipement,
  getLocations,
  addLocation,
  returnLocation,
  getHistorique,
  clearHistorique,
  getCategories,
};
