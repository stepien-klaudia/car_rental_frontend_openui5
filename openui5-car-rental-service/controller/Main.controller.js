// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
//   ], function (Controller) {
//     "use strict";
//     return Controller.extend("openui5-car-rental-service.controller.Main", {});
//   });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
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

            switch (sSelectKey){
                case "zarzadzanie-flota":
                    this.byId("flotaContent").setVisible(true);
                    break;
                case "zarzadzanie-klientami":
                    this.byId("clientContent").setVisible(true);
                    break;
            }
            // if (sSelectKey == "zarzadzanie-flota"){
            //     this.byId("flotaContent").setVisible(true);
            // }

        }
    });
});