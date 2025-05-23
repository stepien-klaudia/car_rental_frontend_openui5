sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("openui5-car-rental-service.controller.Main", {
        onInit: function () {
            // Komunikat powitalny, możesz usunąć jeśli niepotrzebny
            MessageToast.show("Strona główna załadowana!");
        },

        // Funkcja wywoływana po kliknięciu dowolnego kafelka
        onTilePress: function (oEvent) {
            var oSource = oEvent.getSource(); // Pobierz kafelek, który został kliknięty
            var sTitle = oSource.getTitle(); // Pobierz jego tytuł

            // Pobierz niestandardową daną 'targetUrl' przypisaną do kafelka
            var sTargetUrl = oSource.data("targetUrl");

            if (sTargetUrl) {
                MessageToast.show("Otwieram: " + sTargetUrl);
                // Otwórz URL w nowej karcie
                window.open(sTargetUrl, "_blank"); 
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
        }
    
    
    
    });
        
});