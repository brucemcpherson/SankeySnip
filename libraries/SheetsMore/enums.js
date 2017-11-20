/** filter condition
CONDITION_TYPE_UNSPECIFIED	The default value, do not use.
.done.NUMBER_GREATER	The cell's value must be greater than the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.NUMBER_GREATER_THAN_EQ	The cell's value must be greater than or equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.NUMBER_LESS	The cell's value must be less than the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.NUMBER_LESS_THAN_EQ	The cell's value must be less than or equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.NUMBER_EQ	The cell's value must be equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.NUMBER_NOT_EQ	The cell's value must be not equal to the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.NUMBER_BETWEEN	The cell's value must be between the two condition values. Supported by data validation, conditional formatting and filters. Requires exactly two ConditionValues.
.done.NUMBER_NOT_BETWEEN	The cell's value must not be between the two condition values. Supported by data validation, conditional formatting and filters. Requires exactly two ConditionValues.
.done.TEXT_CONTAINS	The cell's value must contain the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.TEXT_NOT_CONTAINS	The cell's value must not contain the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.TEXT_STARTS_WITH	The cell's value must start with the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.TEXT_ENDS_WITH	The cell's value must end with the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
.done.TEXT_EQ	The cell's value must be exactly the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
TEXT_IS_EMAIL	The cell's value must be a valid email address. Supported by data validation. Requires no ConditionValues.
TEXT_IS_URL	The cell's value must be a valid URL. Supported by data validation. Requires no ConditionValues.
DATE_EQ	The cell's value must be the same date as the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
DATE_BEFORE	The cell's value must be before the date of the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue that may be a relative date.
DATE_AFTER	The cell's value must be after the date of the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue that may be a relative date.
DATE_ON_OR_BEFORE	The cell's value must be on or before the date of the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue that may be a relative date.
DATE_ON_OR_AFTER	The cell's value must be on or after the date of the condition's value. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue that may be a relative date.
DATE_BETWEEN	The cell's value must be between the dates of the two condition values. Supported by data validation. Requires exactly two ConditionValues.
DATE_NOT_BETWEEN	The cell's value must be outside the dates of the two condition values. Supported by data validation. Requires exactly two ConditionValues.
DATE_IS_VALID	The cell's value must be a date. Supported by data validation. Requires no ConditionValues.
ONE_OF_RANGE	The cell's value must be listed in the grid in condition value's range. Supported by data validation. Requires a single ConditionValue, and the value must be a valid range in A1 notation.
ONE_OF_LIST	The cell's value must in the list of condition values. Supported by data validation. Supports any number of condition values, one per item in the list. Formulas are not supported in the values.
BLANK	The cell's value must be empty. Supported by data validation, conditional formatting and filters. Requires no ConditionValues.
NOT_BLANK	The cell's value must not be empty. Supported by data validation, conditional formatting and filters. Requires no ConditionValues.
CUSTOM_FORMULA	The condition's formula must evaluate to true. Supported by data validation, conditional formatting and filters. Requires a single ConditionValue.
*/
