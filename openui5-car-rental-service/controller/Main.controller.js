sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("openui5-car-rental-service.controller.Main", {
        onInit: function () {
            var oKpiModel = new sap.ui.model.json.JSONModel();
            Promise.all([
                fetch("http://localhost:8090/api/clients/kpi").then((res) => res.json()),
                fetch("http://localhost:8090/api/branches/kpi").then((res) => res.json()),
                fetch("http://localhost:8090/api/vehicles/kpi").then((res) => res.json())
            ]
            )
            .then(([clientsKPI, branchesKPI, vehiclesKPI]) => {
            oKpiModel.setData(
                {
                    clientsKPI: clientsKPI,
                    branchesKPI: branchesKPI,
                    vehiclesKPI: vehiclesKPI
                }
            );
            }); 
            this.getView().setModel(oKpiModel);
        },

        // Funkcja wywoływana po kliknięciu dowolnego kafelka
        onTilePress: function (oEvent) {
            var oSource = oEvent.getSource(); // Pobierz kafelek, który został kliknięty
            var sTitle = oSource.getHeader(); // Pobierz jego tytuł
            var sRoute = oSource.getAriaLabel();

            // Pobierz niestandardową daną 'targetUrl' przypisaną do kafelka
            // var sTargetUrl = oSource.data("targetUrl");

            if (sRoute) {
                // MessageToast.show("Otwieram: " + sRoute);
                // Otwórz URL w nowej karcie
                this.getOwnerComponent().getRouter().navTo(sRoute,{},true);
            } else {
                MessageToast.show("Kliknięto kafelek: " + sTitle + " (brak docelowego URL)");
            }
        },
        // -------------------Funkcja obsługująca IconTabHeader ---------------
        onTabSelect: function (oEvent){
            var sSelectKey = oEvent.getParameter("key");
            this.byId("flotaContent").setVisible(false);
            this.byId("clientContent").setVisible(false);
            this.byId("pracownikContent").setVisible(false);
            this.byId("rezerwacjaContent").setVisible(false);
            this.byId("punktContent").setVisible(false);
            this.byId("raportContent").setVisible(false);

            switch (sSelectKey){
                case "zarzadzanie-flota":
                    this.byId("flotaContent").setVisible(true);
                    break;
                case "zarzadzanie-klientami":
                    this.byId("clientContent").setVisible(true);
                    break;
                case "zarzadzanie-pracownikami":
                    this.byId("pracownikContent").setVisible(true);
                    break;
                case "zarzadzanie-rezerwacjami":
                    this.byId("rezerwacjaContent").setVisible(true);
                    break;
                case "zarzadzanie-punktami":
                    this.byId("punktContent").setVisible(true);
                    break;
                case "raportowanie":
                    this.byId("raportContent").setVisible(true);
                    break;
            }
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
        }
    
    
    
    });
        
});