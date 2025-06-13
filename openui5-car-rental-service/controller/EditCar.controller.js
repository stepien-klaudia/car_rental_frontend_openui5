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
  "sap/ui/model/Filter"
  ], function (Controller, JSONModel, coreLibrary, Dialog, Button, mobileLibrary, Text, BusyIndicator, MessageBox, Filter) {
    "use strict";
    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;
  
    return Controller.extend("openui5-car-rental-service.controller.EditCar", {
  
      onInit: function () {
        
        var oModel = new JSONModel();
        BusyIndicator.show(0);
        fetch("http://localhost:8090/api/vehicles")
          .then (response => {
            if(!response.ok) throw new Error ("Wystąpił błąd");
            return response.json();
          }) 
          .then(data => {

            data.forEach(vehicle => {
            if (vehicle.status !== "IN_SERVICE") {
              vehicle.showBlock = true;
              vehicle.showUnblock = false;
            } else {
              vehicle.showBlock = false;
              vehicle.showUnblock = true;
            }
            });
            
            oModel.setData({vehicles: data})
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
      this.byId("nrRejSearch").setValue(null);
      this.byId("MarkaSearch").setValue(null);
      this.byId("TypSearch").setValue(null);
      this.byId("StatusSearch").setValue(null);

      this.onFilterPress();
    },

    onFilterPress: function (){

      var aFilters = []
      const rej = this.byId("nrRejSearch").getValue();
      const brand = this.byId("MarkaSearch").getValue();
      const type = this.byId("TypSearch").getSelectedKey();
      const status = this.byId("StatusSearch").getValue();

      if(rej){
        aFilters.push(new sap.ui.model.Filter("id", sap.ui.model.FilterOperator.Contains, rej))
      }
      if(brand){
        aFilters.push(new sap.ui.model.Filter("brand", sap.ui.model.FilterOperator.Contains, brand))
      }
      if(type){
        aFilters.push(new sap.ui.model.Filter("type", sap.ui.model.FilterOperator.EQ, type))
      }
      if(status){
        aFilters.push(new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, status))
      }
      var oTable = this.byId("CarsTable");
      var oBinding = oTable.getBinding("items");

      oBinding.filter([aFilters], "Application")
    },

    onViewPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      this.getOwnerComponent().getRouter().navTo("VehicleView", { id });
    },

    onEditPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
      this.getOwnerComponent().getRouter().navTo("VehicleEdit", { id });
    },

    onBlockPress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getProperty("id");
      this.oBlockApproveMessage = new Dialog({
        type: DialogType.Message,
        title: "Potwierdzenie",
        content: new Text({text: "Czy na pewno chcesz zablokować pojazd?"}),
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: "Tak",
          press: function () {
            const blockDate = new Date();
            blockDate.setDate(blockDate.getDate() + 7)
            const oData = {
              status : "IN_SERVICE",
              lockedUntil: blockDate
            }
            BusyIndicator.show(0);
            $.ajax({
              url: "http://localhost:8090/api/vehicles/" + encodeURIComponent(id) +"/lock",
              type: "PATCH",
              contentType: "application/json",
              data: JSON.stringify(oData),
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

    // onUnblockPress: function (oEvent){
    //   const id = oEvent.getSource().getBindingContext().getProperty("id");
    //   this.oUnblockApproveMessage = new Dialog({
    //     type: DialogType.Message,
    //     title: "Potwierdzenie",
    //     content: new Text({text: "Czy na pewno chcesz odblokować pojazd?"}),
    //     beginButton: new Button({
    //       type: ButtonType.Emphasized,
    //       text: "Tak",
    //       press: function () {
    //         const oData = {
    //           status : "AVIALABLE",
    //           lockedUntil: null
    //         }
    //         BusyIndicator.show(0);
    //         $.ajax({
    //           url: "http://localhost:8090/api/vehicles/" + encodeURIComponent(id) +"/lock",
    //           type: "PATCH",
    //           contentType: "application/json",
    //           data: JSON.stringify(oData),
    //           success: function () {
    //               // sap.m.MessageToast.show("Dane zapisane do bazy!");
    //               sap.m.MessageBox.success("Dane zostały zaktualizowane", {
    //                   onClose: function (oAction){
    //                       // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
    //                       location.reload();
    //                   }.bind(this)
    //               }); 
    //           }.bind(this),
    //           error: function (){
    //               sap.m.MessageBox.error("Podczas zapisu wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
    //                   // this.getOwnerComponent().getRouter().navTo("EditCar",{},true);
    //                   location.reload();
    //               }.bind(this)});
    //           }.bind(this),
    //           complete: function () {
    //               this.oUnblockApproveMessage.close();
    //               BusyIndicator.hide();
    //           }
    //       });
    //     }.bind(this)
    //   }),
    //   endButton: new Button({
    //             type: ButtonType.Emphasized,
    //             text: "Nie",
    //             press: function (){
    //                 this.oUnblockApproveMessage.close();
    //             }.bind(this)
    //         })
    // })
    // this.oUnblockApproveMessage.open();
    // },

    onDeletePress: function (oEvent){
      const id = oEvent.getSource().getBindingContext().getObject().id;
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
              url: "http://localhost:8090/api/vehicles/" + encodeURIComponent(id),
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