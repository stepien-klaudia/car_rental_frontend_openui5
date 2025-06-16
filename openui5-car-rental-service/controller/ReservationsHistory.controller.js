sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
  "sap/ui/core/BusyIndicator",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/core/Fragment"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, BusyIndicator, MessageBox, Filter, Fragment) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.ReservationsHistory", {
  
      onInit: function () {
        
        var oModel = new JSONModel();
        BusyIndicator.show(0);
        Promise.all([
            fetch("http://localhost:8090/api/clients/active")
            .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
            }),  
        ])
        
          .then(([client]) => {
            
            oModel.setData({clients: client, selectedItem:""})
          })
          .catch(error => {
            console.error("Błąd:", error)
          })
          .finally(BusyIndicator.hide());

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

    onFilterPress: function (){

      var aFilters = []
      const client = this.byId("ClientSearch1").getValue();

      // if(client){
      //   aFilters.push(new sap.ui.model.Filter("clientId1", sap.ui.model.FilterOperator.EQ, client))
      // }
      const oModel = this.getView().getModel();
      fetch("http://localhost:8090/api/clients/" + client + "/reservation-history")
        .then(response => response.json())
        .then(data => {
            
            oModel.setProperty("/reservations",data);
        });
    },

    onClientHelpRequest: function () {
    const oView = this.getView();

    if (!this._pClientDialog) {
        this._pClientDialog = Fragment.load({
            id: oView.getId(),
            name: "openui5-car-rental-service.view.fragment.ClientSelectDialog", // <- zmień na swój path do fragment.xml
            controller: this
        }).then(function (oDialog) {
            oView.addDependent(oDialog);
            oDialog.open();
            return oDialog;
        });
    } else {
        this._pClientDialog.then(function (oDialog) {
            oDialog.open();
        });
    }
},

onClientSearch: function (oEvent) {
    const sQuery = oEvent.getParameter("value");
    const oFilter = new sap.ui.model.Filter("lastName", sap.ui.model.FilterOperator.Contains, sQuery);
    oEvent.getSource().getBinding("items").filter([oFilter]);
},

onClientSelect: function (oEvent) {
    const oSelectedItem = oEvent.getParameter("selectedItem");
    if (oSelectedItem) {
        const oClient = oSelectedItem.getBindingContext().getObject();
        this.byId("ClientSearch1").setValue(oClient.id);
        }
},

onDialogCancel: function () {
    // nic nie robimy – użytkownik anulował wybór
},
    })
  });