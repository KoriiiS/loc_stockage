function navigateTo(view) {
  const viewContainer = document.getElementById("view-container");
  let content = "";

  switch (view) {
    case "equipementsLoues":
      const locations = require("./database").getLocations();
      const locationsHtml = locations
        .map(
          (l) => `
        <tr>
            <td>${l.id}</td>
            <td>${l.equipement}</td>
            <td>${l.locataire}</td>
            <td>${l.date_prise}</td>
            <td>${l.date_retour}</td>
            <td>${l.quantite}</td>
            <td><button onclick="returnEquipement(${l.id})">Retourner</button></td>
        </tr>
    `
        )
        .join("");

      content = `
        <h1>Équipements Loués</h1>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Équipement</th>
                    <th>Locataire</th>
                    <th>Date de prise</th>
                    <th>Date de retour</th>
                    <th>Quantité</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${
                  locationsHtml ||
                  "<tr><td colspan='7'>Aucune location en cours.</td></tr>"
                }
            </tbody>
        </table>
    `;
      break;

    case "ajouterLocation":
      const equipements = require("./database").getEquipements();
      const equipementsOptions = equipements
        .map(
          (e) => `<option value="${e.id}">${e.nom} (Dispo: ${e.stock})</option>`
        )
        .join("");

      content = `
            <h1>Ajouter une Location</h1>
            <form onsubmit="addLocation(event)">
                <label for="equipement">Équipement :</label>
                <select id="equipement" required>
                    <option value="" disabled selected>Choisissez un équipement</option>
                    ${equipementsOptions}
                </select>
                <br /><br />
                <label for="locataire">Nom du locataire :</label>
                <input type="text" id="locataire" required />
                <br /><br />
                <label for="datePrise">Date de prise :</label>
                <input type="date" id="datePrise" required />
                <br /><br />
                <label for="dateRetour">Date de retour prévue :</label>
                <input type="date" id="dateRetour" required />
                <br /><br />
                <label for="quantite">Quantité :</label>
                <input type="number" id="quantite" required />
                <br /><br />
                <button type="submit">Ajouter la location</button>
            </form>
        `;
      break;

    case "historique":
      content = `
                <h1>Historique</h1>
                <p>Liste des locations précédentes.</p>`;
      break;

    case "stock":
      try {
        // Récupérer les équipements depuis la base de données
        const equipements = require("./database").getEquipements();

        // Générer dynamiquement le tableau des équipements
        const equipementsHtml = equipements
          .map(
            (e) => `
                <tr>
                    <td>${e.id}</td>
                    <td>${e.nom}</td>
                    <td>${e.stock}</td>
                    <td>
                        <button onclick="editEquipement(${e.id}, '${e.nom}', ${e.stock})">Modifier</button>
                        <button onclick="deleteEquipement(${e.id})">Supprimer</button>
                    </td>
                </tr>
            `
          )
          .join("");

        // Contenu de la vue "Stock"
        content = `
                <h1>Stock</h1>
                <form onsubmit="addEquipement(event)">
                    <input type="text" id="nom" placeholder="Nom de l'équipement" required />
                    <input type="number" id="stock" placeholder="Quantité" required />
                    <button type="submit">Ajouter</button>
                </form>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Quantité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${equipementsHtml}
                    </tbody>
                </table>`;
      } catch (error) {
        console.error("Erreur lors du chargement des équipements :", error);
        // Afficher un message d'erreur si la récupération échoue
        content = "<p>Erreur : Impossible de charger le stock.</p>";
      }
      break;

    default:
      content = `
                <h1>Bienvenue</h1>
                <p>Choisissez une option dans le menu pour commencer.</p>`;
  }

  viewContainer.innerHTML = content;
}

function retournerEquipement(id) {
  alert(`Équipement ID ${id} retourné au stock !`);
}

function ajouterLocation(event) {
  event.preventDefault();
  alert("Nouvelle location ajoutée avec succès !");
}

function addEquipement(event) {
  event.preventDefault();
  const nom = document.getElementById("nom").value;
  const stock = parseInt(document.getElementById("stock").value);

  if (!nom || isNaN(stock) || stock < 0) {
    showMessage("Veuillez fournir un nom valide et une quantité positive.");
    return;
  }

  require("./database").addEquipement(nom, stock);
  showMessage("Équipement ajouté avec succès !");
  navigateTo("stock"); // Recharge la vue
}

function editEquipement(id, currentNom, currentStock) {
  // Ajouter un formulaire modifiable dans l'interface
  const viewContainer = document.getElementById("view-container");

  const editFormHtml = `
    <div id="editForm" style="background: rgba(0, 0, 0, 0.7); position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h2>Modifier un équipement</h2>
        <form onsubmit="submitEditEquipement(event, ${id})">
          <label for="editNom">Nom :</label>
          <input type="text" id="editNom" value="${currentNom}" required />
          <br /><br />
          <label for="editStock">Quantité :</label>
          <input type="number" id="editStock" value="${currentStock}" required />
          <br /><br />
          <button type="submit">Enregistrer</button>
          <button type="button" onclick="cancelEdit()">Annuler</button>
        </form>
      </div>
    </div>
  `;

  viewContainer.insertAdjacentHTML("beforeend", editFormHtml);
}
function submitEditEquipement(event, id) {
  event.preventDefault();

  const newNom = document.getElementById("editNom").value;
  const newStock = parseInt(document.getElementById("editStock").value);

  if (!newNom || isNaN(newStock) || newStock < 0) {
    showMessage("Veuillez fournir un nom valide et une quantité positive.");
    return;
  }

  require("./database").updateEquipement(id, newNom, newStock);
  showMessage("Équipement modifié avec succès !");
  navigateTo("stock"); // Recharge la vue
}
function cancelEdit() {
  const editForm = document.getElementById("editForm");
  if (editForm) editForm.remove(); // Supprimer le formulaire de modification
}

function deleteEquipement(id) {
  // Ajouter un message de confirmation dans l'interface
  const viewContainer = document.getElementById("view-container");
  const confirmationHtml = `
    <div id="confirmation">
      <p>Êtes-vous sûr de vouloir supprimer cet équipement ?</p>
      <button onclick="confirmDeleteEquipement(${id})">Oui</button>
      <button onclick="cancelDelete()">Non</button>
    </div>
  `;

  viewContainer.insertAdjacentHTML("beforeend", confirmationHtml);
}

function confirmDeleteEquipement(id) {
  require("./database").deleteEquipement(id);
  showMessage("Équipement supprimé !");
  navigateTo("stock"); // Recharge la vue
}

function cancelDelete() {
  const confirmation = document.getElementById("confirmation");
  if (confirmation) confirmation.remove(); // Supprimer le message de confirmation
}

function reloadView(view) {
  alert("Action réussie !");
  navigateTo(view);
}

function showLoading(viewContainer) {
  viewContainer.innerHTML = "<p>Chargement en cours...</p>";
}
function showMessage(message) {
  const viewContainer = document.getElementById("view-container");
  const messageHtml = `
    <div id="message" style="position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #4caf50; color: white; padding: 10px; border-radius: 5px;">
      ${message}
    </div>
  `;
  viewContainer.insertAdjacentHTML("beforeend", messageHtml);

  // Supprimer le message après 3 secondes
  setTimeout(() => {
    const messageElement = document.getElementById("message");
    if (messageElement) messageElement.remove();
  }, 3000);
}
function addLocation(event) {
  event.preventDefault();

  const equipementId = parseInt(document.getElementById("equipement").value);
  const locataire = document.getElementById("locataire").value;
  const datePrise = document.getElementById("datePrise").value;
  const dateRetour = document.getElementById("dateRetour").value;
  const quantite = parseInt(document.getElementById("quantite").value);

  if (
    !equipementId ||
    !locataire ||
    !datePrise ||
    !dateRetour ||
    isNaN(quantite) ||
    quantite <= 0
  ) {
    showMessage("Veuillez remplir correctement tous les champs.");
    return;
  }

  const equipement = require("./database")
    .getEquipements()
    .find((e) => e.id === equipementId);

  if (equipement.stock < quantite) {
    showMessage("Quantité insuffisante en stock.");
    return;
  }

  require("./database").addLocation(
    equipementId,
    locataire,
    datePrise,
    dateRetour,
    quantite
  );
  showMessage("Location ajoutée avec succès !");
  navigateTo("equipementsLoues"); // Naviguer vers la liste des équipements loués après l'ajout
}
function returnEquipement(locationId) {
  // Ajouter une confirmation pour le retour
  if (!confirm("Confirmez-vous le retour de cet équipement ?")) return;

  const db = require("./database");

  // Récupérer les détails de la location
  const location = db.getLocations().find((l) => l.id === locationId);

  if (!location) {
    showMessage("Erreur : Location introuvable.");
    return;
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

  showMessage("Équipement retourné avec succès !");
  navigateTo("equipementsLoues"); // Recharge la vue
}
