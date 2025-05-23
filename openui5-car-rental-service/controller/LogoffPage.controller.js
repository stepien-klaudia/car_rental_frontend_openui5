sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("openui5-car-rental-service.controller.LogoffPage", {
  
      onInit: function () {
        // Opcjonalnie: automatyczne przekierowanie po 3 sek.
        // setTimeout(() => {
        //   this.getOwnerComponent().getRouter().navTo("login", {}, true);
        // }, 3000);
      },
  
      onGoToLogin: function () {
        this.getOwnerComponent().getRouter().navTo("Login", {}, true);
      }
  
    });
  });