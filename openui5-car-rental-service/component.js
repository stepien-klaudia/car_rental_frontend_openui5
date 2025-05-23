sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
  ], function (UIComponent, JSONModel) {
    "use strict";
    return UIComponent.extend("openui5-car-rental-service.component", {
      metadata: {
        manifest: "json"
      },
      init: function () {
        UIComponent.prototype.init.apply(this, arguments);
        this.setModel(new JSONModel({ name: "OpenUI5" }));
        this.getRouter().initialize();
      }
    });
  });
  