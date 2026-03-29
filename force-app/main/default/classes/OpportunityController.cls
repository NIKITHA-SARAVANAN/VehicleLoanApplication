public with sharing class OpportunityController {
    public OpportunityController() {

    }
     public class ResponseWrapper {
        @AuraEnabled public Boolean success;
        @AuraEnabled public String message;
        @AuraEnabled public Id recordId;
    }
 
    @AuraEnabled
    public static ResponseWrapper createOpportunity(
        Id accountId,
        String vehicleName,
        Decimal price,
        Decimal downPayment,
        Integer tenure,
        Decimal interestRate,
        Decimal emi
    ) {
        ResponseWrapper res = new ResponseWrapper();
        try {
            //  Create Lead
            Product_Master__c product = [
            SELECT Id
            FROM Product_Master__c
            WHERE Name = :vehicleName
            LIMIT 1
        ];
 
            //  Create Opportunity manually with all custom fields
            Opportunity opp = new Opportunity(
                Name = vehicleName + ' Loan',
                AccountId = accountId ,
                StageName = 'Prospecting',
                CloseDate = Date.today().addMonths(1),
                Vehicle_Name__c =  product.Id,
                Price__c = price,
                Down_Payment__c = downPayment,
                EMI__c = emi,
                Tenure__c = tenure,
                Interest_Rate__c = interestRate
            );
            insert opp;
            res.success = true;
            res.recordId = opp.Id;  
            res.message = 'Created';
 
 
           
        } catch (Exception e) {
            res.success = false;
            res.message = e.getMessage();
        }
        return res;
    }
}