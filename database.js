const Database = require("better-sqlite3");
const db = new Database("data.db");

// Création des tables si elles n'existent pas
db.exec(`
    CREATE TABLE IF NOT EXISTS equipements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        stock INTEGER NOT NULL
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
`);

// Fonctions pour gérer les équipements
function getEquipements() {
  return db.prepare("SELECT * FROM equipements").all();
}

function addEquipement(nom, stock) {
  db.prepare("INSERT INTO equipements (nom, stock) VALUES (?, ?)").run(
    nom,
    stock
  );
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
  // Récupérer les détails de la location
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

  // Réintégrer la quantité dans le stock
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

  // Supprimer la location
  db.prepare(`DELETE FROM locations WHERE id = ?`).run(locationId);

  // Ajouter l'entrée dans l'historique
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
};
