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
     @AuraEnabled
    public static void saveRecord(String name, String make, Decimal engine,
                                  Decimal price, Decimal loanAmount,
                                  Integer tenure, Id masterId) {

        Product2 p = new Product2();

        p.Name = name;
        p.MakeName = make;
        p.Engine_CC__c = engine;
        p.Price__c = price;
        p.Loan_Amount__c = loanAmount;
        p.Tenure__c = tenure;
        p.Product_Master__c = masterId;

        insert p;
    }
}