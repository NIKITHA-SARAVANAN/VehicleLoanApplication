public with sharing class VehicleLoanController {
    public VehicleLoanController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Product_Master__c> getVehicles() {
        return [
            SELECT Id, Name, Make__c, Engine_CC__c, Price__c, Vehicle_Image_URL__c
            FROM Product_Master__c
        ];
    }

}