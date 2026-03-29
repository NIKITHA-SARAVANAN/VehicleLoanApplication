public with sharing class LeadAccountController {
    public LeadAccountController() {

    }
    @AuraEnabled
    public static Id createOrUpdateCustomer(
        String salutation,
        String firstName,
        String lastName,
        String phone,
        String email,
        String aadhaar,
        String pan,
        String employmentType,
        Decimal salary,
        String street,
        String city,
        String state,
        String country,
        String postalCode
    ) {

        // 1. Find Account using Aadhaar (UNIQUE)
        List<Account> accList = [
            SELECT Id, Phone, Salary__pc, PAN_Number__pc
            FROM Account
            WHERE Aadhaar_Number__pc = :aadhaar
            LIMIT 1
        ];

        Account acc;

        if (!accList.isEmpty()) {
            acc = accList[0];

            Boolean needsUpdate = false;

            if (acc.Phone != phone) {
                acc.Phone = phone;
                needsUpdate = true;
            }

            if (acc.Salary__pc != salary) {
                acc.Salary__pc = salary;
                needsUpdate = true;
            }

            if (acc.PAN_Number__pc != pan) {
                acc.PAN_Number__pc = pan;
                needsUpdate = true;
            }

            if (needsUpdate) {
                update acc;
            }

        } else {
            acc = new Account(
                FirstName = firstName,
                LastName = lastName,
                Salutation = salutation,
                Phone = phone,
                Aadhaar_Number__pc = aadhaar,
                PAN_Number__pc = pan,
                Employment_Type__pc = employmentType,
                Salary__pc = salary
            );
            insert acc;
        }

        //  2. Find Lead using Aadhaar
        List<Lead> leadList = [
            SELECT Id, Phone, Email, Street, City, State, PostalCode, Country
            FROM Lead
            WHERE firstName = :firstName
            AND lastName = :lastName
            LIMIT 1
        ];

        if (!leadList.isEmpty()) {
            Lead ld = leadList[0];

            Boolean leadUpdate = false;

            if (ld.Phone != phone) {
                ld.Phone = phone;
                leadUpdate = true;
            }

           if(String.isBlank(ld.Email) || ld.Email.trim().toLowerCase() != email.trim().toLowerCase()) {
                ld.Email = email;
                leadUpdate = true;
            }
             if (ld.Street != street || ld.City != city || ld.State != state ||
            ld.Country != country || ld.PostalCode != postalCode) {

            ld.Street = street;
            ld.City = city;
            ld.State = state;
            ld.Country = country;
            ld.PostalCode = postalCode;

        leadUpdate = true;
        }

            if (leadUpdate) {
                update ld;
            }

        } else {
            Lead newLead = new Lead(
                Salutation = salutation,
                FirstName = firstName,
                LastName = lastName,
                Phone = phone,
                Email = email,
                Status = 'Open - Not Contacted',
                Street = street,
                City = city,
                State = state,
                Country = country,
                PostalCode = postalCode
            );
            insert newLead;
        }

        return acc.Id; 
    }
}