sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageBox"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, BusyIndicator, MessageBox) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.EditCar", {
  
      onInit: function () {
        // pobranie danych z bazy vechicles
      },

      onNavPress: function () {
        this.getOwnerComponent().getRouter().navTo("Main",{},true);
      },

      onProfilePress: function (oEvent){
        const oButton = oEvent.getSource();
        var that = this;

        if (!this._oProfileMenu) {
        this._oProfileMenu = new sap.m.Menu({
        items: [
        new sap.m.MenuItem({
        text: "Zmień motyw na ciemny/jasny",
        icon: "sap-icon://action-settings",
        press: function () {
        sap.ui.core.BusyIndicator.show(0);
        var _oTheme = sap.ui.getCore().getConfiguration().getTheme();
        if (_oTheme == "sap_fiori_3_dark"){
            sap.ui.getCore().applyTheme("sap_fiori_3");
        }
        else{
            sap.ui.getCore().applyTheme("sap_fiori_3_dark");
        };
        sap.ui.core.BusyIndicator.hide();
        sap.m.MessageToast.show("Zmieniono motyw");
        }
        }),
        new sap.m.MenuItem({
        text: "Wyloguj",
        icon: "sap-icon://log",
        press: () => {
            that.getOwnerComponent().getRouter().navTo("Logoff", {}, true);
      }
    })
    ]
    });
    }
    this._oProfileMenu.openBy(oButton);
    },

    onClearPress: function (){
      this.byId("nrRejSearch").setValue("");
      this.byId("MarkaSearch").setValue("");
      this.byId("TypSearch").setValue("");
      this.byId("StatusSearch").setValue("");

    // dodać tutaj funkcję do filtrowania
    },

    onFilterPress: function (){
      // dodać filtrowanie
    },

    onViewPress: function (){
      // const id = oEvent.getSource().getBindingContext().getObject().id; - po podpięciu bazy
      const id = 1;
      this.getOwnerComponent().getRouter().navTo("VehicleView", { id });
    },

    onEditPress: function (){
      // const id = oEvent.getSource().getBindingContext().getObject().id; - po podpięciu bazy
      const id = 1;
      this.getOwnerComponent().getRouter().navTo("VehicleEdit", { id });
    },

    onBlockPress: function (){
      // const id = oEvent.getSource().getBindingContext().getObject().id; - po podpięciu bazy
      const id = 1;
      this.oBlockApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz zablokować pojazd?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/vehicles/${id}/lock",
              type: "PATCH",
              success: function () {
                  // sap.m.MessageToast.show("Dane zapisane do bazy!");
                  sap.m.MessageBox.success("Dane zostały zaktualizowane", {
                      onClose: function (oAction){
                          // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                          location.reload();
                      }.bind(this)
                  }); 
              }.bind(this),
              error: function (){
                  sap.m.MessageBox.error("Podczas zapisu wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
                      // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                      location.reload();
                  }.bind(this)});
              }.bind(this),
              complete: function () {
                  this.oBlockApproveMessage.close();
                  BusyIndicator.hide();
              }
          });
        }.bind(this)
      }),
      endButton: new Button({
                type: ButtonType.Emphasized,
                text: "Nie",
                press: function (){
                    this.oBlockApproveMessage.close();
                }.bind(this)
            })
    })
    this.oBlockApproveMessage.open();
    },

    onDeletePress: function (){
      // const id = oEvent.getSource().getBindingContext().getObject().id; - po podpięciu bazy
      const id = 1;
      this.oDeleteApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz usunąć pojazd z bazy?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/branches/1/vehicles/${id}",
              type: "DELETE",
              success: function () {
                  // sap.m.MessageToast.show("Dane zapisane do bazy!");
                  sap.m.MessageBox.success("Pojazd został usunięty", {
                      onClose: function (oAction){
                          // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                          location.reload();
                      }.bind(this)
                  }); 
              }.bind(this),
              error: function (){
                  sap.m.MessageBox.error("Podczas usuwania wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
                      // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
                      location.reload();
                  }.bind(this)});
              }.bind(this),
              complete: function () {
                  BusyIndicator.hide();
              }
          });
        }.bind(this)
      }),
      endButton: new Button({
                type: ButtonType.Emphasized,
                text: "Nie",
                press: function (){
                    this.oDeleteApproveMessage.close();
                }.bind(this)
            })
    })
    this.oDeleteApproveMessage.open();
    }
    })
  });