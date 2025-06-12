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
  
    return Controller.extend("openui5-car-rental-service.controller.NewEmployee", {
  
      onInit: function () {
        // var oBrandsModel = new JSONModel([
        //     { "BrandId": "AUDI", "BrandName": "Audi" },
        //     { "BrandId": "BMW", "BrandName": "BMW" },
        //     { "BrandId": "FORD", "BrandName": "Ford" },
        //     { "BrandId": "HONDA", "BrandName": "Honda" },
        //     { "BrandId": "MERC", "BrandName": "Mercedes-Benz" },
        //     { "BrandId": "TOYOTA", "BrandName": "Toyota" },
        //     { "BrandId": "VOLVO", "BrandName": "Volvo" }
        // ]);
        // this.getView().setModel(oBrandsModel, "marka");

            // Inicjalizacja ValueHelpDialog, ale bez otwierania go od razu
        this._oValueHelpDialog = null;
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

    validateRequiredFields: function () {
        const oView = this.getView();
        let bAllValid = true;

        // Pobierz wszystkie Inputy w widoku (rekurencyjnie)
        oView.findElements(true).forEach(function (oControl) {
            if (
            !oControl.isA("sap.m.Select") &&
            (oControl.getRequired && oControl.getRequired() &&
            oControl.getEditable()) // pomiń nieedytowalne pola
            ) {
        const sValue = oControl.getValue();
        if (!sValue) {
            oControl.setValueState("Error");
            oControl.setValueStateText("To pole jest wymagane");
            bAllValid = false;
        } else {
            oControl.setValueState("None");
        }
        }
        else if (
            oControl.isA("sap.m.Select")
        ){
            const sValue = oControl.getSelectedKey();
            if (!sValue) {
            oControl.setValueState("Error");
            oControl.setValueStateText("To pole jest wymagane");
            bAllValid = false;
            } else {
            oControl.setValueState("None");
            }
        }
    });

    return bAllValid;
    },


    onAcceptPress: function (){
        if(!this.validateRequiredFields()){
            MessageBox.error("Wypełnij wszystkie pola obowiązkowe!");
            return;
        }
        this.oAcceptAproveMessage = new Dialog({
            type: DialogType.Message,
            title: "Potwierdzenie",
            content: new Text({text: "Czy na pewno chcesz dodać nowego pracownika?"}),
            beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Tak",
                press: function () {
                    // const firstName = this.byId("NewClientFirstName").getValue();
                    // const lastName = this.byId("NewClientLastName").getValue();
                    // const birthDate = this.byId("NewClientBirthDate").getValue();
                    // const idNumber = this.byId("NewClientIDNumber").getValue();
                    // const email = this.byId("NewClientEmail").getValue();
                    // const phone = this.byId("NewClientTelNr").getValue();
                    const firstName = this.byId("NewEmployeeFirstName").getValue();
                    const lastName = this.byId("NewEmployeeLastName").getValue(); 
                    const email = this.byId("NewEmployeeEmail").getValue();
                    const password = this.byId("NewEmployeePassword").getValue();
                    const role = this.byId("NewEmployeeRole").getSelectedKey();
                    const branchId = this.byId("NewEmployeeBranch").getSelectedKey();
                    //insert do bazy - ewentualnie powiadomienie o błędzie
                    const oData = {
                        // firstName: firstName,
                        // lastName: lastName,
                        // birthDate: birthDate,
                        // idNumber: idNumber,
                        // email: email,
                        // phone: phone
                    };
                    BusyIndicator.show(0);
                    $.ajax({
                        url: "http://localhost:8090/api/branches/${branchId}/employees", //endpoint
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(oData),
                        success: function () {
                            // sap.m.MessageToast.show("Dane zapisane do bazy!");
                            sap.m.MessageBox.success("Dane zostały zapisane do bazy", {
                                onClose: function (oAction){
                                     this.getOwnerComponent().getRouter().navTo("Main",{},true);
                                }.bind(this)
                            }); 
                        }.bind(this),
                        error: function (){
                            sap.m.MessageBox.error("Podczas zapisu wystąpił problem, spróbuj ponownie", {onClose: function(oAction){
                                 this.getOwnerComponent().getRouter().navTo("Main",{},true);
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
                    this.oAcceptAproveMessage.close();
                }.bind(this)
            })
            
        }
    )
        this.oAcceptAproveMessage.open();

    },

    onRejectPress: function (){
        this.oRejectAproveMessage = new Dialog({
            type: DialogType.Message,
            title: "Potwierdzenie",
            content: new Text({text: "Czy na pewno chcesz anulować?"}),
            beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Tak",
                press: function () {
                    this.getOwnerComponent().getRouter().navTo("Main",{},true);
                }.bind(this)
            }),
            endButton: new Button({
                type: ButtonType.Emphasized,
                text: "Nie",
                press: function (){
                    this.oRejectAproveMessage.close();
                }.bind(this)
            })
            
        })
        this.oRejectAproveMessage.open();
    }
    });
  });

 