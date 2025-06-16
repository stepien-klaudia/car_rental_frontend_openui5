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
  
    return Controller.extend("openui5-car-rental-service.controller.ClientsReport", {
  
      onInit: function () {
        var oModel = new JSONModel();
        fetch("http://localhost:8090/api/clients/new-clients/0")
          .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
          }) 
          .then(data => {
            oModel.setData({clients: data})
            
          })
          .catch(error => {
            console.error("Błąd:", error)
          });

          this.getView().setModel(oModel);

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
        })
    ]
    });
    }
    this._oProfileMenu.openBy(oButton);
    },

    onClearPress: function (){
      this.byId("EditClientLastNameSearch").setValue(null);
      this.byId("EditClientIdNrSearch").setValue(null);

      this.onFilterPress();
    },

    onFilterPress: function (){
      const lastName = this.byId("EditClientLastNameSearch").getValue();
      const idNr = this.byId("EditClientIdNrSearch").getValue();

      var aFilters = []

      if(lastName){
        aFilters.push(new sap.ui.model.Filter("lastName", sap.ui.model.FilterOperator.Contains, lastName))
      }
      if(idNr){
        aFilters.push(new sap.ui.model.Filter("idNumer", sap.ui.model.FilterOperator.Contains, idNr))
      }
      var oTable = this.byId("ClientsTable");
      var oBinding = oTable.getBinding("items");

      oBinding.filter([aFilters], "Application")

    },

    onRadioButtonSelect: function(oEvent) {
    const oRadioGroup = oEvent.getSource();
    const selectedIndex = oRadioGroup.getSelectedIndex();
    var oModel = this.getView().getModel();
        fetch("http://localhost:8090/api/clients/new-clients/" + encodeURIComponent(selectedIndex))
          .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
          }) 
          .then(data => {
            oModel.setProperty("/clients", data)
            
          })
          .catch(error => {
            console.error("Błąd:", error)
          });
}
    })
  });