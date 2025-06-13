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
  
    return Controller.extend("openui5-car-rental-service.controller.UpcomingInspections", {
  
      onInit: function () {
        var oModel = new sap.ui.model.json.JSONModel();
            Promise.all([
                fetch("http://localhost:8090/api/vehicles/inspectionsAll").then((res) => res.json()),
                // fetch("http://localhost:8090/api/vehicles/inspectionsExpired").then((res) => res.json()),
                // fetch("http://localhost:8090/api/vehicles/inspectionsCurrentMonth").then((res) => res.json()),
                fetch("http://localhost:8090/api/vehicles/kpi").then((res) => res.json())
            ]
            )
            .then(([inspectionsAll, kpi]) => {
            oModel.setData(
                {
                    vehicles: inspectionsAll,
                    // inspectionsExpired: inspectionsExpired,
                    // inspectionsCurrentMonth: inspectionsCurrentMonth,
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

   onFilterSelect: function(oEvent) {
    const sKey = oEvent.getParameter("key");
    switch (sKey) {
        case "All":
            this._loadAllVehicles();
            break;
        case "Warning":
            this._loadVehiclesWithCurrentMonthInspection();
            break;
        case "Critical":
            this._loadVehiclesWithExpiredInspection();
            break;
    }

},

_loadAllVehicles: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles/inspectionsAll")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
},

_loadVehiclesWithCurrentMonthInspection: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles/inspectionsCurrentMonth")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
},

_loadVehiclesWithExpiredInspection: function() {
    const oModel = this.getView().getModel();
    fetch("http://localhost:8090/api/vehicles/inspectionsExpired")
        .then((res) => res.json())
        .then((data) => {
            oModel.setProperty("/vehicles", data);
        });
}


  
    });
  });

 