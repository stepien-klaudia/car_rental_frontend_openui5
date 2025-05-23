sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/core/BusyIndicator"], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("openui5-car-rental-service.controller.Login", {
      onInit: function () {
        this.getView().setModel(new sap.ui.model.json.JSONModel({
          username: "",
          password: ""
        }));
      },
  
      onLogin: function () {
        sap.ui.core.BusyIndicator.show(0);
        const oData = this.getView().getModel().getData();
  
        fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(oData)
        })
        .then(async res => {
          if (!res.ok) {
            throw new Error("Błędny login lub hasło");
          }
          return res.json();
        })
        .then(data => {
          // Zapisz token w lokalnym storage (lub cookie)
          localStorage.setItem("token", data.access_token);
          MessageToast.show("Zalogowano pomyślnie!");
          // Przejdź do widoku głównego
          const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("Main");
        })
        .catch(err => {
          this.byId("statusText").setText(err.message);
          this.byId("statusText").setType("Error");
          this.byId("statusText").setVisible(true);
        })
        .finally( ()=>{
            sap.ui.core.BusyIndicator.hide();
        }
        )
        
      }
    });
  });