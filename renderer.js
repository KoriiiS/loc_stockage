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
      const historique = require("./database").getHistorique();
      const historiqueHtml = historique
        .map(
          (h) => `
              <tr>
                  <td>${h.id}</td>
                  <td>${h.equipement}</td>
                  <td>${h.locataire}</td>
                  <td>${h.date_prise}</td>
                  <td>${h.date_retour}</td>
                  <td>${h.quantite}</td>
              </tr>
          `
        )
        .join("");

      content = `
          <h1>Historique</h1>
          <button onclick="clearHistorique()">Vider l'historique</button>
          <table>
              <thead>
                  <tr>
                      <th>ID</th>
                      <th>Équipement</th>
                      <th>Locataire</th>
                      <th>Date de prise</th>
                      <th>Date de retour</th>
                      <th>Quantité</th>
                  </tr>
              </thead>
              <tbody>
                  ${
                    historiqueHtml ||
                    "<tr><td colspan='6'>Aucun historique disponible.</td></tr>"
                  }
              </tbody>
          </table>
        `;
      break;

    case "stock":
      try {
        const equipements = require("./database").getEquipements();
        const categories = require("./database").getCategories();

        const categoriesOptions = categories
          .map((c) => `<option value="${c.id}">${c.nom}</option>`)
          .join("");

        const equipementsHtml = equipements
          .map(
            (e) => `
                <tr>
                  <td>${e.id}</td>
                  <td>${e.nom}</td>
                  <td>${e.stock}</td>
                  <td>${
                    categories.find((c) => c.id === e.categorie_id)?.nom ||
                    "Aucune"
                  }</td>
                  <td>
                    <button onclick="editEquipement(${e.id}, '${e.nom}', ${
              e.stock
            })">Modifier</button>
                    <button onclick="deleteEquipement(${
                      e.id
                    })">Supprimer</button>
                  </td>
                </tr>
              `
          )
          .join("");

        content = `
            <h1>Stock</h1>
            <form onsubmit="addEquipement(event)">
                <input type="text" id="nom" placeholder="Nom de l'équipement" required />
                <input type="number" id="stock" placeholder="Quantité" required />
                <select id="categorie" required>
                    <option value="" disabled selected>Choisissez une catégorie</option>
                    ${categoriesOptions}
                </select>
                <button type="submit">Ajouter</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Quantité</th>
                        <th>Catégorie</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${equipementsHtml}
                </tbody>
            </table>`;
      } catch (error) {
        console.error("Erreur lors du chargement des équipements :", error);
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
  const categorie = parseInt(document.getElementById("categorie").value);

  if (!nom || isNaN(stock) || stock < 0 || !categorie) {
    showMessage("Veuillez remplir tous les champs correctement.", "error");
    return;
  }

  require("./database").addEquipement(nom, stock, categorie);
  showMessage("Équipement ajouté avec succès !", "success");
  navigateTo("stock");
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
function showMessage(message, type = "success") {
  const alertContainer = document.getElementById("alert-container");

  if (!alertContainer) {
    console.error("Erreur : Impossible de trouver l'élément alert-container.");
    return;
  }

  // Déterminer la couleur de l'alerte
  const backgroundColor = type === "success" ? "#4caf50" : "#f44336";

  // Créer le HTML de l'alerte
  const messageHtml = `
    <div class="alert" style="
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${backgroundColor};
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    ">
      ${message}
    </div>
  `;

  console.log("Insertion de l'alerte dans alert-container...");
  alertContainer.insertAdjacentHTML("beforeend", messageHtml);

  // Supprimer l'alerte après 3 secondes
  setTimeout(() => {
    const alertElement = alertContainer.querySelector(".alert");
    if (alertElement) {
      console.log("Alerte supprimée du DOM.");
      alertElement.remove();
    } else {
      console.error("Impossible de trouver l'alerte à supprimer.");
    }
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
  try {
    // Appeler la fonction returnLocation définie dans database.js
    require("./database").returnLocation(locationId);

    // Afficher une alerte de succès
    showMessage("Équipement retourné avec succès !", "success");

    // Recharger la vue des équipements loués
    navigateTo("equipementsLoues");
  } catch (error) {
    // Gérer les erreurs éventuelles
    console.error("Erreur lors du retour de l'équipement :", error);
    showMessage("Erreur : Impossible de retourner l'équipement.", "error");
  }
}
function clearHistorique() {
  try {
    require("./database").clearHistorique();
    showMessage("Historique vidé avec succès !", "success");
    navigateTo("historique"); // Recharge la vue pour mettre à jour l'affichage
  } catch (error) {
    console.error("Erreur lors du vidage de l'historique :", error);
    showMessage("Erreur : Impossible de vider l'historique.", "error");
  }
}
