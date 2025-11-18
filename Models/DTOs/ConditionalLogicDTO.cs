namespace FormBuilderApi.Models.DTOs;

public class ConditionalLogicDto
{
    public bool Enabled { get; set; }
    public string Condition { get; set; } = "show"; // "show" or "hide"
    public List<ConditionalRuleDto> Rules { get; set; } = new();
    public string Operator { get; set; } = "and"; // "and" or "or"
}

public class ConditionalRuleDto
{
    public string FieldId { get; set; } = string.Empty;
    public string Operator { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Question { get; set; }
    public string? TriggerType { get; set; }
    public string? CustomValue { get; set; }
}
