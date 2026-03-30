public with sharing class BreEngineController {
    public BreEngineController() {

    }
    public static Boolean evaluateDecimal(Decimal value, String operator, Decimal ruleValue) {
        if(operator == null || operator == 'any') return true;
        switch on operator {
            when '>=' { return value >= ruleValue; }
            when '<=' { return value <= ruleValue; }
            when '>'  { return value > ruleValue; }
            when '<'  { return value < ruleValue; }
            when '==' { return value == ruleValue; }
            when else { return false; }
        }
    }

    public static Boolean evaluateInteger(Integer value, String operator, Integer ruleValue) {
        if(operator == null || operator == 'any') return true;
        switch on operator {
            when '>=' { return value >= ruleValue; }
            when '<=' { return value <= ruleValue; }
            when '>'  { return value > ruleValue; }
            when '<'  { return value < ruleValue; }
            when '==' { return value == ruleValue; }
            when else { return false; }
        }
    }

    // Main BRE evaluation
    @AuraEnabled
    public static String evaluateBRE(
        Integer age,
        Decimal salary,
        Decimal foir,
        Integer creditScore,
        Integer dpd,
        String employmentType,
        Id opportunityId
    ) {

        // Fetch rules from BRE_Rule__c
        List<BRE_Rule__c> rules = [
            SELECT Min_Age__c, Max_Age__c,
                  Min_age_Operator__c, Max_age_operator__c,
                   Salary__c, Salary_operator__c,
                   Credit_Score__c, Credit_score_Operator__c,
                   DPD__c, DPD_Operator__c,
                   Max_FOIR__c, Foir_operator__c,
                   Employement_Type__c, Decision__c
            FROM BRE_Rule__c
            ORDER BY CreatedDate ASC
        ];

        String finalDecision = 'Reject';

        for(BRE_Rule__c rule : rules) {

           
            Boolean ageOk = true;
            if(rule.Min_Age__c != null)
                ageOk = evaluateInteger(age, rule.Min_age_Operator__c, Integer.valueOf(rule.Min_Age__c));

            if(rule.Max_Age__c != null)
                ageOk = ageOk && evaluateInteger(age, rule.Max_age_operator__c, Integer.valueOf(rule.Max_Age__c));

           
            Boolean salaryOk = evaluateDecimal(salary, rule.Salary_operator__c, rule.Salary__c);
            Boolean creditOk = evaluateInteger(creditScore, rule.Credit_score_Operator__c , Integer.valueOf(rule.Credit_Score__c));
            Boolean dpdOk = evaluateInteger(dpd, rule.DPD_Operator__c , Integer.valueOf(rule.DPD__c));
            Boolean foirOk = evaluateDecimal(foir, rule.Foir_operator__c, rule.Max_FOIR__c);

            
            Boolean empOk = (rule.Employement_Type__c == 'Any') || (employmentType == rule.Employement_Type__c);

            if(ageOk && salaryOk && creditOk && dpdOk && foirOk && empOk) {
                finalDecision = rule.Decision__c;
                break; 
            }
        }

        Opportunity opp = new Opportunity(
            Id = opportunityId,
            FOIR__c = foir,
            Credit_score__c = creditScore,
            BRE_Decision__c = finalDecision,
            DPD__c = dpd,
            StageName = 'BRE Evaluation'
        );
        update opp;

        return finalDecision;
    }
}