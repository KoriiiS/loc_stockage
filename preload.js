const { contextBridge } = require("electron");
const database = require("./database"); // Assurez-vous que le fichier existe

contextBridge.exposeInMainWorld("api", {
  getEquipements: () => database.getEquipements(),
  addEquipement: (nom, stock) => database.addEquipement(nom, stock),
  getLocations: () => database.getLocations(),
  addLocation: (equipementId, locataire, datePrise, dateRetour, quantite) =>
    database.addLocation(
      equipementId,
      locataire,
      datePrise,
      dateRetour,
      quantite
    ),
  returnEquipement: (locationId) => database.returnLocation(locationId),
});
