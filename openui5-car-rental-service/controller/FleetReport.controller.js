sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, MessageBox, BusyIndicator) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.FleetReport", {
  
      onInit: function () {
        var oModel = new sap.ui.model.json.JSONModel();
            Promise.all([
                fetch("http://localhost:8090/api/vehicles").then((res) => res.json()),
                fetch("http://localhost:8090/api/vehicles/kpi").then((res) => res.json())
            ]
            )
            .then(([vehicles, kpi]) => {
            oModel.setData(
                {
                    vehicles: vehicles,
                    kpi: kpi
                }
            );
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

   onFilterSelect: function(oEvent) {
    const sKey = oEvent.getParameter("key");
    switch (sKey) {
        case "All":
            this._loadAllVehicles();
            break;
        case "Positive":
            this._loadVehiclesAvialable();
            break;
        case "Warning":
            this._loadVehiclesUnavialable();
            break;
        case "Critical":
            this._loadVehiclesInService();
            break;
    }

},

_loadAllVehicles: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
},

_loadVehiclesAvialable: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles/available")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
},

_loadVehiclesUnavialable: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles/unavailable")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
},

_loadVehiclesInService: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles/in-service")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
}

  
    });
  });

 