using AutoMapper;
using FormBuilderApi.Models.DTOs;
using FormBuilderApi.Models.Entities;
using System.Text.Json;

namespace FormBuilderApi.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Form mappings
        CreateMap<Form, FormDto>()
            .ForMember(dest => dest.Fields, opt => opt.MapFrom(src => src.Fields.Where(f => f.ParentId == null).OrderBy(f => f.Order)));

        CreateMap<CreateFormDto, Form>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastModified, opt => opt.Ignore())
            .ForMember(dest => dest.Fields, opt => opt.Ignore())
            .ForMember(dest => dest.Settings, opt => opt.Ignore())
            .ForMember(dest => dest.Responses, opt => opt.Ignore());

        // FormField mappings
        CreateMap<FormField, FormFieldDto>()
            .ForMember(dest => dest.ValidationRules, opt => opt.MapFrom(src => DeserializeJsonProperty(src.ValidationRules)))
            .ForMember(dest => dest.Options, opt => opt.MapFrom(src => DeserializeJsonProperty(src.Options)))
            .ForMember(dest => dest.ConditionalLogic, opt => opt.MapFrom(src => DeserializeJsonProperty(src.ConditionalLogic)))
            .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => DeserializeJsonProperty(src.Metadata)))
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.Children.OrderBy(c => c.Order)));

        CreateMap<CreateFormFieldDto, FormField>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FormId, opt => opt.Ignore())
            .ForMember(dest => dest.ValidationRules, opt => opt.MapFrom(src => SerializeJsonProperty(src.ValidationRules)))
            .ForMember(dest => dest.Options, opt => opt.MapFrom(src => SerializeJsonProperty(src.Options)))
            .ForMember(dest => dest.ConditionalLogic, opt => opt.MapFrom(src => SerializeJsonProperty(src.ConditionalLogic)))
            .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => SerializeJsonProperty(src.Metadata)))
            .ForMember(dest => dest.Form, opt => opt.Ignore())
            .ForMember(dest => dest.Parent, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.Ignore());

        // FormSettings mappings
        CreateMap<FormSettings, FormSettingsDto>();
        
        CreateMap<CreateFormSettingsDto, FormSettings>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FormId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastModified, opt => opt.Ignore())
            .ForMember(dest => dest.Form, opt => opt.Ignore());

        // FormResponse mappings
        CreateMap<FormResponse, FormResponseDto>()
            .ForMember(dest => dest.ResponseData, opt => opt.MapFrom(src => DeserializeJsonProperty(src.ResponseData)));

        CreateMap<CreateFormResponseDto, FormResponse>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ResponseData, opt => opt.MapFrom(src => SerializeJsonProperty(src.ResponseData)))
            .ForMember(dest => dest.SubmittedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Form, opt => opt.Ignore());
    }

    private static object? DeserializeJsonProperty(string? json)
    {
        if (string.IsNullOrEmpty(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<object>(json);
        }
        catch
        {
            return json; // Return as string if deserialization fails
        }
    }

    private static string? SerializeJsonProperty(object? obj)
    {
        if (obj == null)
            return null;

        try
        {
            return JsonSerializer.Serialize(obj);
        }
        catch
        {
            return obj.ToString(); // Return string representation if serialization fails
        }
    }
}