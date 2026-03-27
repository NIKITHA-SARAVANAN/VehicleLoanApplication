public with sharing class ObjectCreator {
    @AuraEnabled
    public static String createLeadAccountOpportunity(
        String salutation,
        String firstName,
        String lastName,
        String phone,
        String aadhaar,
        String pan,
        String employmentType,
        Decimal salary,
        String vehicleName,
        Decimal price,
        Decimal downPayment,
        Integer tenure,
        Decimal interestRate,
        Decimal emi
    ) {
        try {
            //  Create Lead
            Lead newLead = new Lead(
                Salutation = salutation,
                FirstName = firstName,
                LastName = lastName,
                Phone = phone,
                Status = 'Open - Not Contacted'
            );
            insert newLead;

            //  Create Account (Person Account style if enabled, else Business Account)
            Account acc = new Account(
                FirstName = firstName,
                LastName = lastName,
                Phone = phone,
                Aadhaar_Number__pc = aadhaar,
                PAN_Number__pc = pan,
                Employment_Type__pc = employmentType,
                Salary__pc = salary
            );
            insert acc;
            Product_Master__c product = [
            SELECT Id 
            FROM Product_Master__c 
            WHERE Name = :vehicleName 
            LIMIT 1
        ];

            //  Create Opportunity manually with all custom fields
            Opportunity opp = new Opportunity(
                Name = vehicleName + ' Loan',
                AccountId = acc.Id,
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

            return 'Success';
        } catch (Exception e) {
            return 'Error: ' + e.getMessage();
        }
    }
}