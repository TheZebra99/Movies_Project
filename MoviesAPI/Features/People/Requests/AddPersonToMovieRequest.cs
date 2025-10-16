using System.ComponentModel.DataAnnotations;
using MoviesAPI.Models;

namespace MoviesAPI.Features.People.Requests;

public class AddPersonToMovieRequest
{
    [Required]
    public int person_id { get; set; }

    [Required]
    public PersonRole role { get; set; }

    [MaxLength(100)]
    public string? character_name { get; set; }

    public int? billing_order { get; set; }
}